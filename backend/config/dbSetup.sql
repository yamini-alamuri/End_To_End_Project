-- Create Database
CREATE DATABASE IF NOT EXISTS solar_connect_db;
USE solar_connect_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type ENUM('customer', 'provider', 'electrician', 'admin') DEFAULT 'customer',
  approval_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  profile_image VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Solar Providers Table
CREATE TABLE IF NOT EXISTS solar_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  company_registration VARCHAR(100),
  experience_years INT,
  service_areas TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  installation_cost_range VARCHAR(100),
  warranty_years INT,
  government_subsidy_support BOOLEAN DEFAULT FALSE,
  certifications TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  awareness_level ENUM('none', 'basic', 'moderate', 'good', 'expert'),
  willing_to_adopt ENUM('yes', 'no', 'maybe'),
  budget_range VARCHAR(50),
  property_type ENUM('residential', 'commercial', 'industrial'),
  electricity_bill_monthly DECIMAL(10,2),
  primary_concern VARCHAR(255),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_type ON users(user_type);
CREATE INDEX idx_provider_rating ON solar_providers(rating);
