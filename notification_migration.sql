-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, priority, read) VALUES
(1, 'Welcome to Brain Link Tracker', 'Thank you for joining our platform! Get started by creating your first campaign.', 'info', 'medium', false),
(1, 'Security Alert', 'New login detected from a different location. If this wasn''t you, please secure your account.', 'warning', 'high', false),
(1, 'Campaign Performance Update', 'Your Summer Sale campaign has achieved 85% of its target goal.', 'success', 'medium', true),
(1, 'System Maintenance Notice', 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC.', 'info', 'low', true),
(1, 'Payment Processing Error', 'There was an issue processing your subscription payment. Please update your payment method.', 'error', 'high', false);

