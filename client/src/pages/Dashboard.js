// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTasks, FaUserFriends } from "react-icons/fa";
import axios from "axios";
import "../css/Dashboard.css"; // Import the CSS file

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResponse = await axios.get(
          `http://localhost:4000/tasks/getTask`
        );
        // const teamResponse = await axios.get(
        //   `http://localhost:4000/team/getTeam`
        // );
        // setTeamMembers(teamResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        setError("Error fetching data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const taskStats = tasks.reduce(
    (acc, task) => {
      if (task.status === "Completed") acc.completed += 1;
      if (task.status === "In Progress") acc.inProgress += 1;
      if (task.priority === "High") acc.highPriority += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, highPriority: 0 }
  );

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Dashboard</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div>
          <div className="task-stats">
            <div className="task-stat">
              <FaTasks size={50} />
              <h2>Total Tasks: {tasks.length}</h2>
              <p>Completed: {taskStats.completed}</p>
              <p>In Progress: {taskStats.inProgress}</p>
              <p>High Priority: {taskStats.highPriority}</p>
            </div>
            <div className="task-stat">
              <FaUserFriends size={50} />
              <h2>Total Team Members: {teamMembers.length}</h2>
            </div>
          </div>

          <div className="recent-tasks">
            <h3>Recent Tasks</h3>
            <ul className="task-list">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="task-list-item">
                  <Link to={`/tasks/${task.id}`} className="link">
                    {task.name} - {task.status}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: "20px" }}>
            <Link to="/tasks" className="link">
              <h3>Go to Task List</h3>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
