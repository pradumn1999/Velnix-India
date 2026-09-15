import express from 'express';

import authRouter from '../../server/routes/auth';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);

export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}