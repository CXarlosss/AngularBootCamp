import Fastify from 'fastify';
import cors from '@fastify/cors';
import db from './db/schema.js';
import authRoutes from './routes/auth.js';

const app = Fastify({ logger: true });

await app.register(cors, { 
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Health check
app.get('/health', async () => ({ status: 'ok', service: 'authforge' }));

// Registrar rutas
await app.register(authRoutes, { prefix: '/api/auth' });

// Error handler global
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
await app.listen({ port: Number(PORT), host: '0.0.0.0' });
console.log(`🔐 AuthForge running on port ${PORT}`);
