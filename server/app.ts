import express from 'express';

import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import razorpayRouter from './routes/razorpay.js';
import cjRouter from './routes/cjdropshipping.js';
import pincodeRouter from './routes/pincode.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  return app;
}