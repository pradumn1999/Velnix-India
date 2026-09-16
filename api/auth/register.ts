import bcrypt from 'bcryptjs';

import {
  createMongoUser,
  findUserByEmail,
  MongoUser,
  getMongoConnectionMessage,
} from '../../server/db/mongodb';

type RequestWithBody = {
  method?: string;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
};

function sanitizeUser(user: MongoUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export default async function handler(req: RequestWithBody, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed.' });
    return;
  }

  try {
    const { name, email, mobile, password } = req.body || {};

    if (!name || !email || !mobile || !password) {
      res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Mobile number, Password) are required.',
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanMobile = String(mobile).trim();
    const cleanName = String(name).trim();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (await findUserByEmail(cleanEmail)) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
      return;
    }

    const newUser = await createMongoUser({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash: await bcrypt.hash(String(password), 10),
      role: 'customer',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=381219&textColor=f5efe6`,
      addresses: [],
    });

    res.status(201).json({
      success: true,
      message: 'Account registered and securely saved in MongoDB!',
      user: sanitizeUser(newUser),
      isMongo: true,
    });
  } catch (error: any) {
    console.error('[Vercel Auth Register Error]:', error);
    res.status(503).json({
      success: false,
      message: getMongoConnectionMessage(error),
    });
  }
}