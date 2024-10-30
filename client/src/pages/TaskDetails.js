// src/pages/TaskDetails.js
import React from "react";
import { useParams, Link } from "react-router-dom";

const TaskDetails = () => {
  const { id } = useParams();

  // Placeholder task details. In a real app, this would be fetched based on the ID.
  const taskDetails = {
    id,
    name: `Task ${id}`,
    description: "This is a detailed description of the task.",
    status: "In Progress",
    comments: ["Comment 1", "Comment 2"],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Details</h1>
      <h2>{taskDetails.name}</h2>
      <p>
        <strong>Status:</strong> {taskDetails.status}
      </p>
      <p>
        <strong>Description:</strong> {taskDetails.description}
      </p>

      <h3>Comments:</h3>
      <ul>
        {taskDetails.comments.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>

      <Link to="/tasks" style={{ textDecoration: "none", color: "blue" }}>
        Back to Task List
      </Link>
    </div>
  );
};

export default TaskDetails;
