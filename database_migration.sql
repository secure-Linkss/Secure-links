-- Database migration script to fix the schema mismatch
-- This script adds missing columns to the users table

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT '1 Day Trial';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS campaigns_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_link_limit INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS links_used_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_bot_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN DEFAULT FALSE;

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Add campaign_id to links table if it doesn't exist
ALTER TABLE links ADD COLUMN IF NOT EXISTS campaign_id INTEGER;

-- Update existing users to have proper default values
UPDATE users SET role = 'member' WHERE role IS NULL;
UPDATE users SET login_count = 0 WHERE login_count IS NULL;
UPDATE users SET failed_login_attempts = 0 WHERE failed_login_attempts IS NULL;
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL;
UPDATE users SET plan_type = 'free' WHERE plan_type IS NULL;
UPDATE users SET subscription_plan = '1 Day Trial' WHERE subscription_plan IS NULL;
UPDATE users SET status = 'pending' WHERE status IS NULL;
UPDATE users SET campaigns_count = 0 WHERE campaigns_count IS NULL;
UPDATE users SET daily_link_limit = 10 WHERE daily_link_limit IS NULL;
UPDATE users SET links_used_today = 0 WHERE links_used_today IS NULL;
UPDATE users SET last_reset_date = CURRENT_DATE WHERE last_reset_date IS NULL;
UPDATE users SET telegram_enabled = FALSE WHERE telegram_enabled IS NULL;

-- Set Brain user as main_admin if exists
UPDATE users SET role = 'main_admin', is_active = TRUE, is_verified = TRUE, status = 'active' WHERE username = 'Brain';

-- Set 7thbrain user as admin if exists
UPDATE users SET role = 'admin', is_active = TRUE, is_verified = TRUE, status = 'active' WHERE username = '7thbrain';

