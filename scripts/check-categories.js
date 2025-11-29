const mongoose = require('mongoose');
require('dotenv').config();

function ensureEncodedCredentials(uri) {
  if (!uri.includes('@')) {
    return uri;
  }

  const [prefix, rest] = uri.split('://');
  const [credentials, host] = rest.split('@');
  const [username, password] = credentials.split(':');

  const safeUsername = encodeURIComponent(username);
  const safePassword = encodeURIComponent(password);

  return (
    `${prefix}://${safeUsername}:${safePassword}@${host}`
  );
}

const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/scihome';
const MONGODB_URI = ensureEncodedCredentials(rawUri);

const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
const Section = mongoose.models.Section || mongoose.model('Section', new mongoose.Schema({}, { strict: false }));
const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));

async function checkCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check all categories
    const categories = await Category.find({});
    console.log('=== All Categories ===');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat._id})`);
    });

    // Check all sections
    const sections = await Section.find({});
    console.log('\n=== All Sections ===');
    sections.forEach(sec => {
      console.log(`- ${sec.name} (${sec._id})`);
    });

    // Check ม.5 courses
    const m5Courses = await Course.find({ 
      $or: [
        { name: { $regex: '.*ม\\.5.*', $options: 'i' } },
        { level: 'ม.5' }
      ]
    });
    console.log('\n=== All ม.5 Courses ===');
    m5Courses.forEach(course => {
      console.log(`- ${course.name} (categoryId: ${course.categoryId}, sectionId: ${course.sectionId})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCategories();

