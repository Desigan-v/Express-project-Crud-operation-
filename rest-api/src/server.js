"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const user_1 = require("./models/user"); // Adjust path as necessary
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Sequelize connection
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});
// Check the database connection
sequelize.authenticate().then(() => {
    console.log('Connected to the database');
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});
// Routes
// Get all users
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.User.findAll();
    res.json(users);
}));
// Get user by ID
app.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.findByPk(req.params.id);
    if (user) {
        res.json(user);
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
}));
// Create new user with profile picture
app.post('/users', upload.single('profilePicture'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, city, country } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    try {
        const user = yield user_1.User.create({ name, email, phone, city, country, profilePicture });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating user', error });
    }
}));
// Update user by ID
app.put('/users/:id', upload.single('profilePicture'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, city, country } = req.body;
    const profilePicture = req.file ? req.file.filename : null;
    try {
        const user = yield user_1.User.findByPk(req.params.id);
        if (user) {
            yield user.update({ name, email, phone, city, country, profilePicture });
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating user', error });
    }
}));
// Delete user by ID
app.delete('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findByPk(req.params.id);
        if (user) {
            yield user.destroy();
            res.json({ message: 'User deleted successfully' });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting user', error });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
