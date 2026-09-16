import express from 'express';

import ordersRouter from '../server/routes/orders.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/orders', ordersRouter);

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}
