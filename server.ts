import express from 'express';
import path from 'path';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';

import productsRouter from './server/routes/products';
import ordersRouter from './server/routes/orders';
import razorpayRouter from './server/routes/razorpay';
import cjRouter from './server/routes/cjdropshipping';
import pincodeRouter from './server/routes/pincode';
import statsRouter from './server/routes/stats';
import authRouter from './server/routes/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Velnix Backend API with MongoDB Auth',
      timestamp: new Date().toISOString(),
      modules: {
        auth: 'mongodb',
        products: 'active',
        orders: 'active',
        razorpay: 'active',
        cjdropshipping: 'active',
        pincode: 'active',
      },
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/razorpay', razorpayRouter);
  app.use('/api/cjdropshipping', cjRouter);
  app.use('/api/pincode', pincodeRouter);
  app.use('/api/stats', statsRouter);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Velnix Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
