import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { authService } from '../services/authService.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: number; email: string; role: string };
  }
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  
  try {
    const user = authService.verifyAccessToken(token);
    request.user = user;
  } catch (err: any) {
    return reply.status(401).send({ error: err.message });
  }
}
