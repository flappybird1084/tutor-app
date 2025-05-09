// src/server/routes/auth.ts
import express, { Request, Response } from 'express';

export const userdataAPIRouter = express.Router();

userdataAPIRouter.get('/username', async (req: any, res: any) => {
  try {
    // Check if the user is authenticated
    const reqUserPayload = req.user;
    if (!reqUserPayload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const username = req.user?.username;
    if (!username) {
      return res.status(400).json({ error: 'Username not found in payload' });
    }
    // Return the username
    res.json({ username });
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
