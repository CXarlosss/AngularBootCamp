import db from '../db/schema.js';
import { authService } from './authService.js';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

export class OAuthService {
  // Paso 1: Generar URL de autorización de GitHub
  getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: 'http://localhost:4000/api/auth/oauth/github/callback',
      scope: 'user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  // Paso 2: Intercambiar code por access token
  async exchangeGitHubCode(code: string): Promise<{ access_token: string }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    return response.json();
  }

  // Paso 3: Obtener datos del usuario de GitHub
  async getGitHubUser(token: string): Promise<any> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response.json();
  }

  // Paso 4: Login o registro automático
  async githubLoginOrRegister(code: string): Promise<{ user: any; tokens: any }> {
    const tokenData = await this.exchangeGitHubCode(code);
    const githubUser = await this.getGitHubUser(tokenData.access_token);
    
    // Buscar usuario por email de GitHub
    let user = db.prepare('SELECT id, email, role, is_2fa_enabled FROM users WHERE email = ?')
      .get(githubUser.email) as any;
    
    if (!user) {
      // Crear usuario con password aleatorio (no usable)
      const randomPassword = Math.random().toString(36).slice(2);
      const result = authService.register(githubUser.email, randomPassword, 'user');
      user = result.user;
    }
    
    // Generar tokens propios
    const tokens = authService.generateTokens(user);
    authService.saveRefreshToken(user.id, tokens.refreshToken);
    
    return { user, tokens };
  }
}

export const oauthService = new OAuthService();
