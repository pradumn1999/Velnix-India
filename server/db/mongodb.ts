import { MongoClient, Db, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';

export interface MongoAddress {
  id: string;
  fullName: string;
  mobile: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work';
  isDefault: boolean;
}

export interface MongoUser {
  _id?: any;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  addresses: MongoAddress[];
  createdAt: Date;
  updatedAt: Date;
}

let client: MongoClient | null = null;
let dbInstance: Db | null = null;
let connectionPromise: Promise<Db | null> | null = null;

// High-fidelity in-memory fallback store when MONGODB_URI is not provided yet
const inMemoryUsers: Map<string, MongoUser> = new Map();

// Seed initial demo user in memory fallback
(async () => {
  try {
    const demoPasswordHash = await bcrypt.hash('password123', 10);
    const demoUser: MongoUser = {
      name: 'Pradumn Mandal',
      email: 'pradumn@example.com',
      mobile: '+91 98765 43210',
      passwordHash: demoPasswordHash,
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      addresses: [
        {
          id: 'addr-1',
          fullName: 'Pradumn Mandal',
          mobile: '+91 98765 43210',
          addressLine: 'Flat 402, Royal Palms Residency, Outer Ring Road, Bellandur',
          landmark: 'Near EcoSpace Tech Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          type: 'Home',
          isDefault: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryUsers.set(demoUser.email.toLowerCase(), demoUser);
  } catch (err) {
    console.error('Error seeding demo user:', err);
  }
})();

/**
 * Connect to MongoDB with lazy initialization and graceful fallback
 */
export async function getDatabase(): Promise<{ db: Db | null; isFallback: boolean }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    return { db: null, isFallback: true };
  }

  if (dbInstance) {
    return { db: dbInstance, isFallback: false };
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        console.log('[MongoDB] Connecting to MongoDB...');
        client = new MongoClient(uri, {
          connectTimeoutMS: 8000,
          serverSelectionTimeoutMS: 8000,
        });
        await client.connect();
        
        const dbName = uri.split('?')[0].split('/').pop() || 'velnix';
        dbInstance = client.db(dbName || 'velnix');
        
        console.log(`[MongoDB] Connected successfully to database: "${dbInstance.databaseName}"`);
        
        // Ensure unique index on email
        const usersCol = dbInstance.collection<MongoUser>('users');
        await usersCol.createIndex({ email: 1 }, { unique: true });
        
        return dbInstance;
      } catch (err) {
        console.warn('[MongoDB] Connection failed, falling back to memory store:', err);
        client = null;
        dbInstance = null;
        return null;
      }
    })();
  }

  const db = await connectionPromise;
  return { db, isFallback: !db };
}

/**
 * Get the Users collection or fallback handler
 */
export async function findUserByEmail(email: string): Promise<MongoUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const { db, isFallback } = await getDatabase();

  if (!isFallback && db) {
    const col = db.collection<MongoUser>('users');
    const user = await col.findOne({ email: normalizedEmail });
    return user;
  }

  // Fallback to in-memory store
  return inMemoryUsers.get(normalizedEmail) || null;
}

/**
 * Register/Create a new user
 */
export async function createMongoUser(userData: Omit<MongoUser, 'createdAt' | 'updatedAt'>): Promise<MongoUser> {
  const normalizedEmail = userData.email.toLowerCase().trim();
  const fullUser: MongoUser = {
    ...userData,
    email: normalizedEmail,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { db, isFallback } = await getDatabase();

  if (!isFallback && db) {
    const col = db.collection<MongoUser>('users');
    const result = await col.insertOne(fullUser as any);
    fullUser._id = result.insertedId;
    return fullUser;
  }

  // Fallback to in-memory store
  fullUser._id = `mem_${Date.now()}`;
  inMemoryUsers.set(normalizedEmail, fullUser);
  return fullUser;
}

/**
 * Update existing user
 */
export async function updateMongoUser(
  email: string,
  partial: Partial<Omit<MongoUser, '_id' | 'email' | 'createdAt'>>
): Promise<MongoUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const { db, isFallback } = await getDatabase();

  if (!isFallback && db) {
    const col = db.collection<MongoUser>('users');
    await col.updateOne(
      { email: normalizedEmail },
      { $set: { ...partial, updatedAt: new Date() } }
    );
    return await col.findOne({ email: normalizedEmail });
  }

  // Fallback
  const existing = inMemoryUsers.get(normalizedEmail);
  if (!existing) return null;
  const updated: MongoUser = {
    ...existing,
    ...partial,
    updatedAt: new Date(),
  };
  inMemoryUsers.set(normalizedEmail, updated);
  return updated;
}

/**
 * Check MongoDB Connection Status
 */
export async function getMongoStatus() {
  const uri = process.env.MONGODB_URI;
  const isConfigured = !!(uri && uri.trim() !== '' && !uri.includes('<username>'));
  
  if (!isConfigured) {
    return {
      status: 'unconfigured',
      connected: false,
      isFallback: true,
      message: 'MONGODB_URI not set in environment. Running in active fallback mode.',
    };
  }

  try {
    const { db, isFallback } = await getDatabase();
    if (db && !isFallback) {
      return {
        status: 'connected',
        connected: true,
        isFallback: false,
        database: db.databaseName,
        message: 'Successfully connected to MongoDB cluster.',
      };
    } else {
      return {
        status: 'error',
        connected: false,
        isFallback: true,
        message: 'Could not connect to MongoDB URI. Using fallback mode.',
      };
    }
  } catch (err: any) {
    return {
      status: 'error',
      connected: false,
      isFallback: true,
      error: err?.message || 'Connection error',
    };
  }
}
