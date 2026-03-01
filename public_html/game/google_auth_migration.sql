-- Add Google Auth columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Create game_saves table for Juggler and Tetris
CREATE TABLE IF NOT EXISTS game_saves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_type VARCHAR(50) NOT NULL, -- 'juggler', 'tetris'
    save_data LONGTEXT, -- JSON data
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_game (user_id, game_type)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update minecraft_worlds to link to users
ALTER TABLE minecraft_worlds ADD COLUMN IF NOT EXISTS user_id INT NULL;
ALTER TABLE minecraft_worlds ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
