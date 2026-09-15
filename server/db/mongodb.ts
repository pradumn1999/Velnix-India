import { MongoClient, Db, Collection } from 'mongodb';

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
let lastConnectionError: string | null = null;

export function getMongoConnectionMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/tls|ssl/i.test(message)) {
    return 'MongoDB Atlas TLS connection failed. Check the Atlas IP allowlist, cluster status, and local antivirus/VPN TLS inspection, then restart the server.';
  }
  return `MongoDB connection failed: ${message}`;
}

/**
 * Connect to MongoDB with lazy initialization.
 */
export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('<username>')) {
    throw new Error('MONGODB_URI is not configured. Set it in the environment before using authentication.');
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        console.log('[MongoDB] Connecting to MongoDB...');
        client = new MongoClient(uri, {
          connectTimeoutMS: 20000,
          serverSelectionTimeoutMS: 20000,
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
        lastConnectionError = err instanceof Error ? err.message : String(err);
        console.error('[MongoDB] Connection failed:', lastConnectionError);
        client = null;
        dbInstance = null;
        connectionPromise = null;
        return null;
      }
    })();
  }

  const db = await connectionPromise;
  if (!db) {
    throw new Error(getMongoConnectionMessage(lastConnectionError || 'unknown connection error'));
  }
  return db;
}

export async function findUserByEmail(email: string): Promise<MongoUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDatabase();
  const col = db.collection<MongoUser>('users');
  return col.findOne({ email: normalizedEmail });
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

  const db = await getDatabase();
  const col = db.collection<MongoUser>('users');
  const result = await col.insertOne(fullUser as any);
  fullUser._id = result.insertedId;
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
  const db = await getDatabase();
  const col = db.collection<MongoUser>('users');
  await col.updateOne(
    { email: normalizedEmail },
    { $set: { ...partial, updatedAt: new Date() } }
  );
  return col.findOne({ email: normalizedEmail });
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
      message: 'MONGODB_URI not set in environment. MongoDB storage is required.',
    };
  }

  try {
    const db = await getDatabase();
    return {
      status: 'connected',
      connected: true,
      database: db.databaseName,
      message: 'Successfully connected to MongoDB cluster.',
    };
  } catch (err: any) {
    return {
      status: 'error',
      connected: false,
      message: getMongoConnectionMessage(err),
    };
  }
}
