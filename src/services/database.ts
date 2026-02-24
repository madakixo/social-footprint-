import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production'
  ? path.resolve(process.cwd(), 'data', 'social_network.db')
  : path.resolve(process.cwd(), 'social_network.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      region TEXT,
      state TEXT,
      lga TEXT,
      ward TEXT,
      constituency TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      location TEXT,
      latitude REAL,
      longitude REAL,
      region TEXT,
      state TEXT,
      lga TEXT,
      ward TEXT,
      constituency TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reposts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      postId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (postId) REFERENCES posts(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      location TEXT,
      latitude REAL,
      longitude REAL,
      region TEXT,
      state TEXT,
      lga TEXT,
      ward TEXT,
      constituency TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      profilerId TEXT NOT NULL,
      targetUserId TEXT,
      name TEXT,
      age INTEGER,
      gender TEXT,
      occupation TEXT,
      bio TEXT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      region TEXT,
      state TEXT,
      lga TEXT,
      ward TEXT,
      constituency TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profilerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      ownerId TEXT NOT NULL,
      region TEXT,
      state TEXT,
      lga TEXT,
      ward TEXT,
      constituency TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_members (
      groupId TEXT NOT NULL,
      userId TEXT NOT NULL,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (groupId, userId),
      FOREIGN KEY (groupId) REFERENCES groups(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_profiles (
      groupId TEXT NOT NULL,
      profileId TEXT NOT NULL,
      addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (groupId, profileId),
      FOREIGN KEY (groupId) REFERENCES groups(id),
      FOREIGN KEY (profileId) REFERENCES profiles(id)
    );
  `);
  console.log('Database initialized.');
}

export default db;
