CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    verification_token VARCHAR(255),
    is_verified TINYINT(1) DEFAULT 0,
    remember_token VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vocabulary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    sentence TEXT,
    source VARCHAR(255),
    meaning TEXT,
    dictionary_type VARCHAR(20) DEFAULT 'en-ja',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
