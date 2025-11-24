import mongoose from 'mongoose';

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';

function ensureEncodedCredentials(uri: string) {
  const credentialPattern = /(mongodb(?:\+srv)?:\/\/)([^@]+)@/;
  const match = uri.match(credentialPattern);

  if (!match) {
    return uri;
  }

  const [, prefix, credentials] = match;
  if (!credentials.includes(':')) {
    return uri;
  }

  const [username, password] = credentials.split(':');

  const safeUsername = encodeURIComponent(username);
  const safePassword = encodeURIComponent(password);

  return uri.replace(
    credentialPattern,
    `${prefix}${safeUsername}:${safePassword}@`
  );
}

const MONGODB_URI = ensureEncodedCredentials(rawUri);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@')); // Hide credentials in log
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }) as any;
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
