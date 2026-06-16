import { FastifyRequest, FastifyReply } from 'fastify';

export function roleGuard(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        error: 'Forbidden',
        message: `Required role: ${allowedRoles.join(' or ')}`,
        yourRole: request.user.role
      });
    }
  };
}
