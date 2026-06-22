require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ayush200491_db_user:e1uLDvAIduGgmKTE@cluster0.obj8htg.mongodb.net/healthcare?appName=Cluster0');
    console.log('MongoDB Connected for seeding...');

    const adminEmail = 'admin@healthcare.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin',
        phoneNumber: '1112223333',
        gender: 'male',
        dob: new Date('1990-01-01'),
        profileCompleted: true,
      });
      console.log('Default Admin Account seeded successfully!');
      console.log('Email: admin@healthcare.com');
      console.log('Password: adminpassword123');
    } else {
      console.log('Admin account already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
