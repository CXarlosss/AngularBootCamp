import { FastifyInstance } from 'fastify';
import { authService } from '../services/authService.js';
import { oauthService } from '../services/oauthService.js';
import db from '../db/schema.js';
import { authGuard } from '../middleware/authGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin', 'guest']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
  
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);
      const result = authService.register(body.email, body.password, body.role);
      
      reply.status(201).send({
        message: 'User registered successfully',
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        tokens: result.tokens,
      });
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      // Primero login normal
      const result = authService.login(body.email, body.password);
      
      // La validación 2FA se hace en /2fa/login, aquí solo decimos si lo requiere.
      if (result.user.is_2fa_enabled) {
         return reply.send({
           message: '2FA required',
           requires2FA: true,
           tempToken: result.tokens.accessToken // en un flujo real usaríamos un token temporal corto
         });
      }
      
      reply.send({
        message: 'Login successful',
        user: { id: result.user.id, email: result.user.email, role: result.user.role },
        tokens: result.tokens,
      });
    } catch (err: any) {
      reply.status(401).send({ error: err.message });
    }
  });

  // POST /api/auth/2fa/setup (protegido)
  fastify.post('/2fa/setup', { preHandler: [authGuard] }, async (request, reply) => {
    const result = await authService.enable2FA(request.user!.id);
    
    reply.send({
      secret: result.secret, // Solo para debug, en prod no enviar
      qrCode: result.qrCodeUrl, // Base64 image
      manualEntryKey: result.secret,
    });
  });

  // POST /api/auth/2fa/verify (protegido, activa 2FA)
  fastify.post('/2fa/verify', { preHandler: [authGuard] }, async (request, reply) => {
    const { token } = request.body as { token: string };
    
    const isValid = authService.verify2FASetup(request.user!.id, token);
    if (!isValid) return reply.status(400).send({ error: 'Invalid TOTP code' });
    
    reply.send({ message: '2FA enabled successfully' });
  });

  // POST /api/auth/2fa/login (login con 2FA)
  fastify.post('/2fa/login', async (request, reply) => {
    const { email, password, totpToken } = request.body as any;
    
    // Primero login normal
    const result = authService.login(email, password);
    
    // Luego verificar 2FA si está activo
    if (result.user.is_2fa_enabled) {
      const isValid = authService.verify2FALogin(result.user.id, totpToken);
      if (!isValid) {
        // Revocar tokens generados
        authService.logout(result.tokens.refreshToken);
        return reply.status(401).send({ error: 'Invalid 2FA code' });
      }
    }
    
    reply.send({
      message: 'Login successful',
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      tokens: result.tokens,
    });
  });

  // POST /api/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      if (!refreshToken) throw new Error('Refresh token required');
      
      const tokens = authService.refresh(refreshToken);
      reply.send({ tokens });
    } catch (err: any) {
      reply.status(401).send({ error: err.message });
    }
  });

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      if (refreshToken) authService.logout(refreshToken);
      reply.send({ message: 'Logged out successfully' });
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  });

  // GET /api/auth/me (protegido)
  fastify.get('/me', { preHandler: [authGuard] }, async (request, reply) => {
    reply.send({
      user: request.user,
      message: 'Token valid',
      expiresIn: '15 minutes',
    });
  });

  // GET /api/auth/sessions (protegido, solo admin)
  fastify.get('/sessions', { preHandler: [authGuard, roleGuard('admin')] }, async (request, reply) => {
    const sessions = authService.getActiveSessions(request.user!.id);
    reply.send({ sessions });
  });

  // GET /api/auth/admin-only (protegido, solo admin)
  fastify.get('/admin/dashboard', { preHandler: [authGuard, roleGuard('admin')] }, async (request, reply) => {
    reply.send({
      message: 'Welcome to admin dashboard',
      user: request.user,
      stats: {
        totalUsers: 42, // mock
        activeSessions: 15,
        securityLevel: 'high',
      },
    });
  });

  // GET /api/auth/oauth/github — Redirige a GitHub
  fastify.get('/oauth/github', async (request, reply) => {
    const state = Math.random().toString(36).slice(2); // En producción: guardar en Redis/DB
    const url = oauthService.getGitHubAuthUrl(state);
    reply.redirect(url);
  });

  // GET /api/auth/oauth/github/callback — Callback de GitHub
  fastify.get('/oauth/github/callback', async (request, reply) => {
    const { code, error } = request.query as any;
    
    if (error) {
      return reply.status(400).send({ error: 'GitHub authorization denied' });
    }
    
    try {
      const result = await oauthService.githubLoginOrRegister(code);
      
      // En producción: redirigir al frontend con tokens en URL segura
      reply.send({
        message: 'GitHub login successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  });

  // GET /api/auth/sessions/all (admin only, lista todas las sesiones del sistema)
  fastify.get('/sessions/all', { preHandler: [authGuard, roleGuard('admin')] }, async (request, reply) => {
    const sessions = db.prepare(`
      SELECT rt.id, rt.user_id, u.email, rt.token, rt.created_at, rt.expires_at, rt.revoked
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      ORDER BY rt.created_at DESC
      LIMIT 100
    `).all();
    
    reply.send({ sessions });
  });

  // DELETE /api/auth/sessions/:id (revocar sesión específica, admin o propietario)
  fastify.delete('/sessions/:id', { preHandler: [authGuard] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const sessionId = Number(id);
    
    // Verificar que es admin o dueño de la sesión
    const session = db.prepare('SELECT user_id FROM refresh_tokens WHERE id = ?').get(sessionId) as any;
    if (!session) return reply.status(404).send({ error: 'Session not found' });
    
    if (request.user!.role !== 'admin' && session.user_id !== request.user!.id) {
      return reply.status(403).send({ error: 'Cannot revoke this session' });
    }
    
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(sessionId);
    reply.send({ message: 'Session revoked successfully' });
  });
}
