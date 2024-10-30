require("dotenv").config(); // Load environment variables from .env file
const mysql = require("mysql2/promise"); // Use the promise-based version

// Function to ensure the database and tasks table exists
const ensureDatabaseAndTableExists = async () => {
  let connection;

  try {
    // Create initial connection to check database existence
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // Check if the database exists
    const [databases] = await connection.query("SHOW DATABASES");
    const dbExists = databases.some(
      (db) => db.Database === process.env.DB_NAME
    );

    // Create the database if it doesn't exist
    if (!dbExists) {
      await connection.query(`CREATE DATABASE \`${process.env.DB_NAME}\``);
      console.log(`Database ${process.env.DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }

    // Close the initial connection
    await connection.end();

    // Create connection to the specific database
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    // Create tasks table if it doesn't exist
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status ENUM('Not Started', 'In Progress', 'Completed') NOT NULL DEFAULT 'Not Started',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Tasks table is ensured to exist.");
    await dbConnection.end(); // Close the connection to the database
  } catch (error) {
    console.error("Error ensuring database or tasks table exists:", error);
    if (connection) await connection.end(); // Ensure the connection is closed on error
  }
};

// Call the function to ensure the database and table exist
ensureDatabaseAndTableExists().catch((error) => {
  console.error("Error during database initialization:", error);
});

// Create a connection pool for handling multiple requests
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10, // Limit the number of connections in the pool
  queueLimit: 0, // No limit on the queue of pending connections
});

// Export the pool for use in other files
module.exports = pool;
