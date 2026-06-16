import db from '../db/schema.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'authforge-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

export interface User {
  id: number;
  email: string;
  role: string;
  is_2fa_enabled: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Registro
  register(email: string, password: string, role = 'user'): { user: User; tokens: Tokens } {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) throw new Error('Email already registered');

    const passwordHash = bcrypt.hashSync(password, 12);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    ).run(email, passwordHash, role);

    const user = db.prepare('SELECT id, email, role, is_2fa_enabled FROM users WHERE id = ?')
      .get(result.lastInsertRowid) as User;

    const tokens = this.generateTokens(user);
    this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  // Login
  login(email: string, password: string): { user: User; tokens: Tokens } {
    const user = db.prepare(
      'SELECT id, email, password_hash, role, is_2fa_enabled FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user) throw new Error('Invalid credentials');
    if (!bcrypt.compareSync(password, user.password_hash)) throw new Error('Invalid credentials');

    const userObj: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      is_2fa_enabled: user.is_2fa_enabled,
    };

    const tokens = this.generateTokens(userObj);
    this.saveRefreshToken(userObj.id, tokens.refreshToken);

    return { user: userObj, tokens };
  }

  // Refresh token
  refresh(refreshToken: string): Tokens {
    const stored = db.prepare(
      'SELECT user_id, revoked, expires_at FROM refresh_tokens WHERE token = ?'
    ).get(refreshToken) as any;

    if (!stored) throw new Error('Invalid refresh token');
    if (stored.revoked) throw new Error('Token revoked');
    if (new Date(stored.expires_at) < new Date()) throw new Error('Token expired');

    // Revocar el token usado (rotación)
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(refreshToken);

    const user = db.prepare('SELECT id, email, role, is_2fa_enabled FROM users WHERE id = ?')
      .get(stored.user_id) as User;

    const tokens = this.generateTokens(user);
    this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Logout (revocar refresh token)
  logout(refreshToken: string): void {
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(refreshToken);
  }

  // Logout all sessions (revocar todos los refresh tokens del usuario)
  logoutAll(userId: number): void {
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(userId);
  }

  // Verificar access token
  verifyAccessToken(token: string): User {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        is_2fa_enabled: decoded.is_2fa_enabled,
      };
    } catch {
      throw new Error('Invalid or expired access token');
    }
  }

  // Generar tokens
  generateTokens(user: User): Tokens {
    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, is_2fa_enabled: user.is_2fa_enabled },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, issuer: 'authforge', audience: 'authforge-api' }
    );

    const refreshToken = randomBytes(64).toString('hex');

    return { accessToken, refreshToken };
  }

  // Guardar refresh token en DB
  saveRefreshToken(userId: number, token: string): void {
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN);
    db.prepare(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
    ).run(userId, token, expiresAt.toISOString());
  }

  // Obtener sesiones activas del usuario
  getActiveSessions(userId: number): any[] {
    return db.prepare(
      'SELECT id, token, created_at, expires_at FROM refresh_tokens WHERE user_id = ? AND revoked = 0 AND expires_at > ?'
    ).all(userId, new Date().toISOString());
  }

  // 2FA Methods
  async enable2FA(userId: number): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = authenticator.generateSecret();
    
    db.prepare('UPDATE users SET totp_secret = ?, is_2fa_enabled = 0 WHERE id = ?')
      .run(secret, userId);

    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as any;
    const otpauthUrl = authenticator.keyuri(user.email, 'AuthForge', secret);
    
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    
    return { secret, qrCodeUrl };
  }

  verify2FASetup(userId: number, token: string): boolean {
    const user = db.prepare('SELECT totp_secret FROM users WHERE id = ?').get(userId) as any;
    if (!user?.totp_secret) throw new Error('2FA not initialized');

    const isValid = authenticator.verify({ token, secret: user.totp_secret });
    
    if (isValid) {
      db.prepare('UPDATE users SET is_2fa_enabled = 1 WHERE id = ?').run(userId);
    }
    
    return isValid;
  }

  verify2FALogin(userId: number, token: string): boolean {
    const user = db.prepare('SELECT totp_secret, is_2fa_enabled FROM users WHERE id = ?').get(userId) as any;
    if (!user?.is_2fa_enabled) return true;

    return authenticator.verify({ token, secret: user.totp_secret });
  }
}

export const authService = new AuthService();
