import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth';
import { authAPIRouter, authMiddleware } from './routes/api/auth-api';
import cookieParser from 'cookie-parser';
import { clientRouter } from './routes/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const jwtKey: string = process.env.JWT_SECRET_KEY || '1';
const mongoIP: string = process.env.MONGO_IP || 'localhost';
const mongoPort: string = process.env.MONGO_PORT || '27017';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
console.log(__dirname, __filename);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
app.use(authMiddleware);

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/api/auth', authAPIRouter);
app.use('/api/userdata', authAPIRouter);
app.use('/auth', authRouter);
app.use('/', clientRouter);

mongoose
  .connect(`mongodb://${mongoIP}:${mongoPort}/tutordb`, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.render('index');
});
app.listen(3000, (): void => {
  console.log('Server listening on 3000');
});
