-- 数据库 Schema 初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 约定表
CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending',
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  meeting_id TEXT REFERENCES meetings(id)
);

-- 打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  commitment_id TEXT NOT NULL REFERENCES commitments(id),
  checked_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- 见面记录表
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 照片表
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  commitment_id TEXT REFERENCES commitments(id),
  meeting_id TEXT REFERENCES meetings(id),
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_commitments_status ON commitments(status);
CREATE INDEX IF NOT EXISTS idx_commitments_category ON commitments(category);
CREATE INDEX IF NOT EXISTS idx_commitments_meeting_id ON commitments(meeting_id);
CREATE INDEX IF NOT EXISTS idx_checkins_commitment_id ON checkins(commitment_id);
CREATE INDEX IF NOT EXISTS idx_photos_commitment_id ON photos(commitment_id);
CREATE INDEX IF NOT EXISTS idx_photos_meeting_id ON photos(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);

-- 插入默认管理员账号 (密码：123456，实际部署时需要修改)
INSERT OR IGNORE INTO users (id, password_hash, created_at, updated_at)
VALUES (
  'admin',
  '$2a$10$-default-hash-change-me',
  strftime('%s', 'now'),
  strftime('%s', 'now')
);
