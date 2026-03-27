/**
 * Seed Admin User
 * Run: node backend/scripts/seedAdmin.js
 * Creates the hardcoded admin account if it doesn't already exist.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User.model');

const ADMIN_EMAIL = 'admin@dalchaal.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_USERNAME = 'superadmin';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supermarket-simulator';

(async () => {
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            if (existing.role !== 'admin') {
                existing.role = 'admin';
                await existing.save();
                console.log('⬆️  Existing user promoted to admin:', ADMIN_EMAIL);
            } else {
                console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
            }
        } else {
            await User.create({
                username: ADMIN_USERNAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('🎉 Admin user created!');
        }

        console.log('─────────────────────────────');
        console.log('  Email   :', ADMIN_EMAIL);
        console.log('  Password:', ADMIN_PASSWORD);
        console.log('─────────────────────────────');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
})();
