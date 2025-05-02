const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
require('dotenv').config();

const seedUsersAndTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();

    // Create users
    const users = await User.create([
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: '123456'
      },
      {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: '123456'
      }
    ]);

    // Create tasks for each user
    for (const user of users) {
      await Task.create([
        {
          title: 'Complete project',
          description: 'Finish the task manager application',
          status: 'incomplete',
          priority: 'High',
          user: user._id
        },
        {
          title: 'Write documentation',
          description: 'Create README and API docs',
          status: 'incomplete',
          priority: 'Medium',
          user: user._id
        },
        {
          title: 'Test offline functionality',
          description: 'Verify tasks sync when back online',
          status: 'completed',
          priority: 'Low',
          user: user._id
        }
      ]);
    }

    console.log('Database seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedUsersAndTasks();