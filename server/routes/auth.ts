import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  createMongoUser,
  updateMongoUser,
  getMongoStatus,
  getDatabase,
  MongoUser,
  MongoAddress,
  getMongoConnectionMessage,
} from '../db/mongodb';

const router = Router();

// Helper to strip sensitive fields
function sanitizeUser(user: MongoUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * GET /api/auth/status
 * Check if MongoDB is connected or running in fallback
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await getMongoStatus();
    res.json({
      success: true,
      ...status,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to check MongoDB status',
    });
  }
});

/**
 * POST /api/auth/register
 * Register a new user and save to MongoDB
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Mobile number, Password) are required.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanMobile = String(mobile).trim();
    const cleanName = String(name).trim();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.',
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Initial default address list
    const initialAddress: MongoAddress = {
      id: `addr-${Date.now()}`,
      fullName: cleanName,
      mobile: cleanMobile,
      addressLine: 'Sector 44, Galleria Market',
      landmark: 'Near Metro Station',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122003',
      type: 'Home',
      isDefault: true,
    };

    // Save to MongoDB
    const newUser = await createMongoUser({
      name: cleanName,
      email: cleanEmail,
      mobile: cleanMobile,
      passwordHash,
      role: 'customer',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=381219&textColor=f5efe6`,
      addresses: [initialAddress],
    });

    const { isFallback } = await getDatabase();

    res.status(201).json({
      success: true,
      message: isFallback
        ? 'Account registered successfully (Demo storage mode).'
        : 'Account registered and securely saved in MongoDB!',
      user: sanitizeUser(newUser),
      isMongo: !isFallback,
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    res.status(503).json({
      success: false,
      message: getMongoConnectionMessage(err),
    });
  }
});

/**
 * POST /api/auth/login
 * Verify user credentials against MongoDB
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Query user from MongoDB
    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // Verify hashed password with bcrypt
    const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const { isFallback } = await getDatabase();

    res.json({
      success: true,
      message: isFallback
        ? 'Signed in successfully.'
        : 'Signed in successfully via MongoDB authentication.',
      user: sanitizeUser(user),
      isMongo: !isFallback,
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({
      success: false,
      message: err?.message || 'Sign in failed due to an internal server error.',
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user details in MongoDB
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { email, name, mobile, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    const updated = await updateMongoUser(String(email), {
      ...(name ? { name: String(name).trim() } : {}),
      ...(mobile ? { mobile: String(mobile).trim() } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB.',
      user: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

/**
 * POST /api/auth/addresses
 * Add a shipping address to the user record in MongoDB
 */
router.post('/addresses', async (req: Request, res: Response) => {
  try {
    const { email, address } = req.body;

    if (!email || !address) {
      return res.status(400).json({ success: false, message: 'Email and address data are required.' });
    }

    const user = await findUserByEmail(String(email));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in MongoDB.' });
    }

    const newId = `addr-${Date.now()}`;
    const newAddr: MongoAddress = {
      ...address,
      id: newId,
      isDefault: user.addresses.length === 0 || address.isDefault,
    };

    let updatedList = [...user.addresses];
    if (newAddr.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(newAddr);

    const updatedUser = await updateMongoUser(String(email), {
      addresses: updatedList,
    });

    res.json({
      success: true,
      message: 'Address saved to MongoDB.',
      user: updatedUser ? sanitizeUser(updatedUser) : null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message });
  }
});

export default router;
