import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initDb, db } from "./src/services/database";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json()); // For parsing application/json

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User registration
  app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)')
        .run(id, username, email, hashedPassword);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'Username or email already exists' });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User login
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // In a real app, you'd generate a JWT here and send it back.
      // For now, we'll just send a success message.
      res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new post
  // Get all posts
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = db.prepare('SELECT p.*, u.username FROM posts p JOIN users u ON p.userId = u.id ORDER BY p.createdAt DESC').all();
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/posts', async (req, res) => {
    const { userId, content, location, latitude, longitude, region, state, lga, ward, constituency } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    try {
      const id = uuidv4();
      db.prepare(
        'INSERT INTO posts (id, userId, content, location, latitude, longitude, region, state, lga, ward, constituency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, userId, content, location, latitude, longitude, region, state, lga, ward, constituency);
      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new repost
  app.post('/api/reposts', async (req, res) => {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ message: 'User ID and Post ID are required' });
    }

    try {
      const id = uuidv4();
      db.prepare('INSERT INTO reposts (id, userId, postId) VALUES (?, ?, ?)')
        .run(id, userId, postId);
      res.status(201).json({ message: 'Repost created successfully' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'You have already reposted this post' });
      }
      console.error('Error creating repost:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new alert
  app.post('/api/alerts', async (req, res) => {
    const { userId, type, message, location, latitude, longitude, region, state, lga, ward, constituency } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ message: 'User ID, type, and message are required' });
    }

    try {
      const id = uuidv4();
      db.prepare(
        'INSERT INTO alerts (id, userId, type, message, location, latitude, longitude, region, state, lga, ward, constituency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, userId, type, message, location, latitude, longitude, region, state, lga, ward, constituency);
      res.status(201).json({ message: 'Alert created successfully' });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new profile
  app.post('/api/profiles', async (req, res) => {
    const { proFilerId, targetUserId, name, age, gender, occupation, bio, location, latitude, longitude, region, state, lga, ward, constituency } = req.body;

    if (!proFilerId || !name) {
      return res.status(400).json({ message: 'Profiler ID and name are required' });
    }

    try {
      const id = uuidv4();
      db.prepare(
        'INSERT INTO profiles (id, profilerId, targetUserId, name, age, gender, occupation, bio, location, latitude, longitude, region, state, lga, ward, constituency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, proFilerId, targetUserId, name, age, gender, occupation, bio, location, latitude, longitude, region, state, lga, ward, constituency);
      res.status(201).json({ message: 'Profile created successfully' });
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all profiles (or profiles by profilerId)
  // Update an existing profile
  app.put('/api/profiles/:id', async (req, res) => {
    const { id } = req.params;
    const { name, age, gender, occupation, bio, location, latitude, longitude, region, state, lga, ward, constituency } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Profile name is required' });
    }

    try {
      db.prepare(
        'UPDATE profiles SET name = ?, age = ?, gender = ?, occupation = ?, bio = ?, location = ?, latitude = ?, longitude = ?, region = ?, state = ?, lga = ?, ward = ?, constituency = ? WHERE id = ?'
      ).run(name, age, gender, occupation, bio, location, latitude, longitude, region, state, lga, ward, constituency, id);
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/profiles', async (req, res) => {
    const { profilerId } = req.query;
    try {
      let profiles;
      if (profilerId) {
        profiles = db.prepare('SELECT * FROM profiles WHERE profilerId = ?').all(profilerId);
      } else {
        profiles = db.prepare('SELECT * FROM profiles').all();
      }
      res.status(200).json(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create a new group
  app.post('/api/groups', async (req, res) => {
    const { name, description, ownerId, region, state, lga, ward, constituency } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ message: 'Group name and owner ID are required' });
    }

    try {
      const id = uuidv4();
      db.prepare(
        'INSERT INTO groups (id, name, description, ownerId, region, state, lga, ward, constituency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(id, name, description, ownerId, region, state, lga, ward, constituency);
      res.status(201).json({ message: 'Group created successfully' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'Group name already exists' });
      }
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all groups
  app.get('/api/groups', async (req, res) => {
    try {
      const groups = db.prepare('SELECT g.*, u.username as ownerUsername FROM groups g JOIN users u ON g.ownerId = u.id').all();
      res.status(200).json(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Join a group
  app.post('/api/groups/:groupId/join', async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      db.prepare('INSERT INTO group_members (groupId, userId) VALUES (?, ?)').run(groupId, userId);
      res.status(201).json({ message: 'Joined group successfully' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'User already a member of this group' });
      }
      console.error('Error joining group:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  initDb();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
