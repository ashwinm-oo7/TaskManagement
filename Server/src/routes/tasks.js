const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import the database connection

// Define a route to get all tasks
router.get("/getTask", async (req, res) => {
  try {
    const [tasks] = await pool.query("SELECT * FROM tasks");

    // Check if tasks are empty
    if (tasks.length === 0) {
      return res.status(200).json({ message: "No tasks found." });
    }

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks");
  }
});

// Define a route to create a new task
router.post("/addTask", async (req, res) => {
  const { name, description, dueDate, status, priority } = req.body;
  const validPriorities = ["Low", "Medium", "High"]; // Valid priorities

  const validStatuses = ["Not Started", "In Progress", "Completed", "Pending"];

  // Check if the provided status is valid
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Allowed values are: ${validStatuses.join(", ")}`,
    });
  }
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      error: `Invalid priority. Allowed values are: ${validPriorities.join(
        ", "
      )}`,
    });
  }

  // Basic validation
  if (!name || !dueDate) {
    return res.status(400).json({
      error: "Name and due date are required fields.",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (name, description, due_date, status,priority) VALUES (?, ?, ?, ?,?)",
      [name, description, dueDate, status, priority, priority]
    );
    const newTask = {
      id: result.insertId,
      name,
      description,
      dueDate,
      status,
      priority,
    };
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Error creating task");
  }
});

// Define a route to update an existing task
router.put("/updateTask/:id", async (req, res) => {
  const taskId = req.params.id;
  const { name, description, dueDate, status, priority } = req.body;

  const validPriorities = ["Low", "Medium", "High"]; // Valid priorities
  const validStatuses = ["Not Started", "In Progress", "Completed", "Pending"];

  // Validate provided status and priority
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Allowed values are: ${validStatuses.join(", ")}`,
    });
  }
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      error: `Invalid priority. Allowed values are: ${validPriorities.join(
        ", "
      )}`,
    });
  }

  // Basic validation
  if (!name || !dueDate) {
    return res.status(400).json({
      error: "Name and due date are required fields.",
    });
  }

  try {
    // Update the task in the database
    const [result] = await pool.query(
      "UPDATE tasks SET name = ?, description = ?, due_date = ?, status = ?, priority = ? WHERE id = ?",
      [name, description, dueDate, status, priority, taskId]
    );

    // Check if the task was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Return the updated task
    const updatedTask = {
      id: taskId,
      name,
      description,
      dueDate,
      status,
      priority,
    };
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Error updating task");
  }
});

// Define a route to delete a task
router.delete("/deleteTask/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [
      taskId,
    ]);

    // Check if the task was found and deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Error deleting task");
  }
});

// Define a route to add a comment to a task
router.post("/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO comments (task_id, content) VALUES (?, ?)",
      [taskId, content]
    );
    const newComment = {
      id: result.insertId,
      taskId,
      content,
      created_at: new Date(),
    };
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Error adding comment");
  }
});

// Define a route to get all tasks with their comments
router.get("/tasksWithComments", async (req, res) => {
  try {
    // Fetch tasks
    const [tasks] = await pool.query("SELECT * FROM tasks");

    // For each task, fetch its comments
    const tasksWithComments = await Promise.all(
      tasks.map(async (task) => {
        const [comments] = await pool.query(
          "SELECT * FROM comments WHERE task_id = ?",
          [task.id]
        );
        return {
          ...task,
          comments,
        };
      })
    );

    res.json(tasksWithComments);
  } catch (error) {
    console.error("Error fetching tasks with comments:", error);
    res.status(500).send("Error fetching tasks with comments");
  }
});

// Define a route to get comments for a task
router.get("/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;

  try {
    const [comments] = await pool.query(
      "SELECT * FROM comments WHERE task_id = ?",
      [taskId]
    );
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Error fetching comments");
  }
});

router.put("/:taskId/comments/:commentId", async (req, res) => {
  const { taskId, commentId } = req.params;
  const { content } = req.body;

  // Validate the content
  if (!content) {
    return res.status(400).json({ error: "Comment content is required." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE comments SET content = ? WHERE id = ? AND task_id = ?",
      [content, commentId, taskId]
    );

    // Check if the comment was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Comment not found." });
    }

    const updatedComment = {
      id: commentId,
      taskId,
      content,
      updated_at: new Date(),
    };
    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).send("Error updating comment");
  }
});

// Define a route to delete a comment
router.delete("/:taskId/comments/:commentId", async (req, res) => {
  const { taskId, commentId } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM comments WHERE id = ? AND task_id = ?",
      [commentId, taskId]
    );

    // Check if the comment was found and deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Comment not found." });
    }

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).send("Error deleting comment");
  }
});

module.exports = router;
