// src/pages/TaskList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Importing edit icon
import axios from "axios";
import "../css/TaskList.css"; // Import the CSS file

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // For tracking task being edited
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    dueDate: "",
    status: "",
    priority: "",
    teamMember: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [comments, setComments] = useState({}); // Store comments for each task
  const [newComment, setNewComment] = useState(""); // Store new comment
  // const [commentEditData, setEditingComment] = useState(null);
  const [commentEditData, setCommentEditData] = useState(null); // Store which comment is being edited

  const [filter, setFilter] = useState(""); // Filter by name
  const [filteredTasks, setFilteredTasks] = useState([]); // For filtered tasks

  // Filter state
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/tasks/tasksWithComments"
        );
        console.log(response);
        if (response.status === 200 && response.data.length > 0) {
          const updatedTasks = response.data.reverse().map((task) => ({
            ...task,
            dueDate: task.due_date, // Map due_date to dueDate
          }));

          setTasks(updatedTasks);
          setFilteredTasks(updatedTasks); // Set filtered tasks initially to all tasks
          setLoading(false);
        } else {
          console.log(response);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Filter by due date
    if (dueDateFilter) {
      filtered = filtered.filter((task) => task.dueDate === dueDateFilter);
    }

    setFilteredTasks(filtered);
  };

  // Call filterTasks whenever filters change
  useEffect(() => {
    filterTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, dueDateFilter, tasks]);

  useEffect(() => {
    if (editingTask) {
      const fetchComments = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4000/tasks/${editingTask.id}/comments`
          );
          setComments((prev) => ({
            ...prev,
            [editingTask.id]: response.data,
          }));
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
      fetchComments();
    }
  }, [editingTask]);

  const handleCommentSubmit = async (taskId) => {
    if (!newComment) return;
    setIsSubmitting(true);

    try {
      if (commentEditData) {
        // Update existing comment
        const response = await axios.put(
          `http://localhost:4000/tasks/${commentEditData.taskId}/comments/${commentEditData.comment.id}`,
          { content: newComment }
        );
        setComments((prev) => ({
          ...prev,
          [commentEditData.taskId]: prev[commentEditData.taskId].map(
            (comment) =>
              comment.id === commentEditData.comment.id
                ? response.data
                : comment
          ),
        }));
        setCommentEditData(null); // Reset editing state
      } else {
        // Create a new comment
        const response = await axios.post(
          `http://localhost:4000/tasks/${taskId}/comments`,
          { content: newComment }
        );
        setComments((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), response.data],
        }));
      }
      setNewComment(""); // Reset comment input
    } catch (error) {
      console.error("Error adding/updating comment:", error);
    } finally {
      setIsSubmitting(false); // Always set back to false
    }
  };

  const handleEditComment = (taskId, comment) => {
    setCommentEditData({ taskId, comment }); // Set the specific comment to be edited
    setNewComment(comment.content); // Populate the input with the current comment content
  };

  // Handle modal form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTask) {
      // Update existing task
      try {
        const response = await axios.put(
          `http://localhost:4000/tasks/updateTask/${editingTask.id}`,
          newTask
        );
        const updatedTasks = tasks.map((task) =>
          task.id === editingTask.id ? response.data : task
        );
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        setEditingTask(null); // Reset editing state
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      // Create a new task
      try {
        const response = await axios.post(
          `http://localhost:4000/tasks/addTask`,
          newTask
        );
        const createdTask = {
          ...response.data,
          dueDate: response.data.due_date, // Ensure dueDate is mapped correctly
        };

        setTasks((prevTasks) => [...prevTasks, createdTask]); // Update task list with new task
        setFilteredTasks((prevTasks) => [...prevTasks, createdTask]); // Update filtered list as well
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
    // Close the modal and reset form fields
    setShowModal(false);
    setNewTask({
      name: "",
      description: "",
      dueDate: "",
      status: "",
      priority: "",
    });
  };

  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:4000/tasks/deleteTask/${taskId}`);
        // Filter out the deleted task from the state
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Open the modal for editing a task
  // Open the modal for editing a task
  const handleEdit = (task) => {
    setNewTask({
      ...task,
      dueDate: formatDate(task.due_date), // Format due_date to yyyy-MM-dd
    });
    setEditingTask(task); // Set the task being edited
    setShowModal(true); // Open the modal
  };

  // Search function
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilter(value);
    setFilteredTasks(
      tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(value) ||
          task.description.toLowerCase().includes(value) ||
          task.status.toLowerCase().includes(value) ||
          task.priority.toLowerCase().includes(value)
      )
    );
  };

  return (
    <div className="task-list-container">
      <h1 className="title">Task List</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search tasks by name or description"
        value={filter}
        onChange={handleSearch}
        className="search-input"
      />
      {loading && <div className="loading-spinner">Loading...</div>}

      <div className="filter-controls">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
        />
      </div>

      <button className="add-task-button" onClick={() => setShowModal(true)}>
        <FaPlus size={16} /> Add New Task
      </button>

      {/* Modal for creating/updating a task */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTask ? "Edit Task" : "Create New Task"}</h2>
            <form onSubmit={handleSubmit} className="task-form">
              <label>
                Task Name:
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Due Date:
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Status:
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label>
                Priority:
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>
                Assign To:
                <input
                  type="text"
                  value={newTask.teamMember}
                  onChange={(e) =>
                    setNewTask({ ...newTask, teamMember: e.target.value })
                  }
                  placeholder="Enter team member's name"
                />
              </label>

              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null); // Reset editing state
                    setNewTask({
                      name: "",
                      description: "",
                      dueDate: "",
                      status: "",
                      priority: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task, index) => (
            <li key={task.id} className="task-item">
              <Link to={`/tasks/${task.id}`} className="task-link">
                <h3>
                  {index + 1}.{task.name}
                </h3>
                <p>{task.description}</p>
                <p>Due Date: {task.dueDate}</p>

                <p>Status: {task.status}</p>
                <p>Priority: {task.priority}</p>
                <p>Assigned To: {task.team_member || "Not Assigned"}</p>
              </Link>
              <h4>Comments:</h4>
              <ul>
                {task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <li key={comment.id}>
                      {commentEditData &&
                      commentEditData.comment.id === comment.id ? (
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                      ) : (
                        comment.content
                      )}
                      <button
                        onClick={() => handleEditComment(task.id, comment)}
                      >
                        Edit
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No comments yet.</li>
                )}
              </ul>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave a comment"
              />

              <button
                onClick={() => handleCommentSubmit(task.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Comment"}
              </button>

              <hr />
              <button
                className="edit-task-button"
                onClick={() => handleEdit(task)}
              >
                <FaEdit size={16} /> Edit
              </button>
              <button
                className="delete-task-button"
                onClick={() => handleDelete(task.id)} // Add delete functionality
              >
                <FaTrash size={16} /> Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
