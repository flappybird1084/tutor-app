import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth';
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const jwtKey: string = process.env.JWT_SECRET_KEY || '1';
const mongoIP: string = process.env.MONGO_IP || 'localhost';
const mongoPort: string = process.env.MONGO_PORT || '27017';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use("/auth", authRouter);

mongoose
  .connect(`mongodb://${mongoIP}:${mongoPort}/tutordb`, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });


app.listen(3000, (): void => {
  console.log("Server listening on 3000");
});
