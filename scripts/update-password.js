const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Function to encode credentials in MongoDB URI
function ensureEncodedCredentials(uri) {
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

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';
const MONGODB_URI = ensureEncodedCredentials(rawUri);

// Registration Schema (simplified for password update)
const RegistrationSchema = new mongoose.Schema({
  username: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  name: String,
  email: String,
}, { 
  strict: false, 
  timestamps: true,
  collection: 'studentmanagement' // ใช้ collection name ที่ถูกต้อง
});

// ใช้ model ที่มีอยู่แล้วหรือสร้างใหม่
const Registration = mongoose.models.StudentManagement || mongoose.model('StudentManagement', RegistrationSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function updatePassword() {
  try {
    const username = 'engdev';
    const newPassword = 'CJdctJmNxI8n7vV3oXip';

    // ค้นหา user ด้วย username (case-insensitive)
    const user = await Registration.findOne({ 
      username: username.toLowerCase() 
    }).select('+password');

    if (!user) {
      console.error(`ไม่พบ user ชื่อ "${username}" ในฐานข้อมูล`);
      process.exit(1);
    }

    console.log(`พบ user: ${user.name} (${user.username})`);

    // Hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดต password
    user.password = hashedPassword;
    await user.save();

    console.log(`อัปเดต password ของ user "${username}" สำเร็จแล้ว`);
    console.log(`Password ใหม่: ${newPassword}`);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

async function main() {
  await connectDB();
  await updatePassword();
}

main();

