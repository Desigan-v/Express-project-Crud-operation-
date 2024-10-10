import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { Sequelize } from 'sequelize';
import { User } from './models/user';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

// Check the database connection
sequelize.authenticate().then(() => {
  console.log('Connected to the database');
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});

// Routes

// Get all users
app.get('/users', async (req: Request, res: Response) => {
  const users = await User.findAll();
  res.json(users);
});

// Get user by ID
app.get('/user/:id', async (req: Request, res: Response) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Create new user with profile picture
app.post('/aduser', upload.single('profilePicture'), async (req: Request, res: Response) => {
  const { name, email, phone, city, country } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const user = await User.create({ name, email, phone, city, country, profilePicture });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});

// Update user by ID
app.put('/upuser/:id', upload.single('profilePicture'), async (req: Request, res: Response) => {
  const { name, email, phone, city, country } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ name, email, phone, city, country, profilePicture });
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
  }
});

// Delete user by ID
app.delete('/deluser/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/*Why Use Sequelize?
  Simplified Database Operations
  Modeling
  Associations
  Migrations*/

  // for start ther server "node dist/server.js"
