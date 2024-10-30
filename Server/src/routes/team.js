const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the database connection

// Function to check if the team table exists
const checkTableExists = async () => {
  const [tables] = await pool.query("SHOW TABLES LIKE 'team'");
  return tables.length > 0; // Returns true if the table exists
};

// Define a route to get all team members
router.get("/getTeam", async (req, res) => {
  try {
    // Check if the team table exists
    console.log("/getTeam");

    const tableExists = await checkTableExists();
    if (!tableExists) {
      return res.status(404).json({ message: "Team table does not exist." });
    }

    const [teamMembers] = await pool.query("SELECT * FROM team");

    // Check if team members are empty
    if (teamMembers.length === 0) {
      return res.status(200).json({ message: "No team members found." });
    }

    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).send("Error fetching team members");
  }
});

// Define a route to create a new team member
router.post("/addMember", async (req, res) => {
  const { name, role, email } = req.body;

  // Check if the team table exists
  const tableExists = await checkTableExists();
  if (!tableExists) {
    return res.status(404).json({ message: "Team table does not exist." });
  }

  // Basic validation
  if (!name || !role || !email) {
    return res.status(400).json({
      error: "Name, role, and email are required fields.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format.",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO team (name, role, email) VALUES (?, ?, ?)",
      [name, role, email]
    );
    const newMember = { id: result.insertId, name, role, email };
    res.status(201).json(newMember);
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).send("Error adding team member");
  }
});

module.exports = router;
