const express = require("express");
const cors = require("cors"); // Import CORS
const app = express();
const pool = require("./db"); // Import the connection pool
const PORT = process.env.PORT || 4000;
const bodyParser = require("body-parser");
require("dotenv").config();
const tasksRouter = require("./routes/tasks");
const teamRouter = require("./routes/team");

app.use(cors()); // Enable all CORS requests
app.use(express.json());
app.use(bodyParser.json());

// Example route to get data from the database
app.get("/test-connection", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    res.send(`Database Connection Successful. 1 + 1 = ${rows[0].solution}`);
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).send("Database connection error");
  }
});
// app.use("/tasks", require("./routes/tasks"));
app.use("/tasks", tasksRouter);
app.use("/team", teamRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
