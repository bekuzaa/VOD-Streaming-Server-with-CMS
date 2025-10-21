db = db.getSiblingDB('vod_streaming');

db.createCollection('users');
db.createCollection('videos');
db.createCollection('settings');

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.videos.createIndex({ title: 'text', description: 'text', tags: 'text' });
db.videos.createIndex({ status: 1 });
db.videos.createIndex({ uploadedBy: 1 });
db.videos.createIndex({ createdAt: -1 });

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('admin123', salt);

db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: hashedPassword,
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

db.settings.insertMany([
  { key: 'site_name', value: 'VOD Streaming Server', type: 'string', category: 'general', isEditable: true },
  { key: 'max_upload_size', value: 5368709120, type: 'number', category: 'storage', isEditable: true },
  { key: 'token_expiry', value: 3600, type: 'number', category: 'security', isEditable: true },
  { key: 'allowed_domains', value: ['localhost', '127.0.0.1'], type: 'array', category: 'security', isEditable: true }
]);

print('Database initialized successfully!');
