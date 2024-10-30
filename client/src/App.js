import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login.js";
import SignUp from "./components/SignUp.js";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import TaskDetails from "./pages/TaskDetails";

// import HomePage from "./components/HomePage";

// import MyAccount from "./components/MyAccount";

// import Header from "./components/Header";

// import LoginRecords from "./components/LoginRecords";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const App = (props) => {
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [userEmail, setUserEmail] = useState(false);
  // const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const location = useLocation();

  // useEffect(() => {
  //   const isAdmin = localStorage.getItem("isAdmin") === "true";
  //   const userEmail = localStorage.getItem("userEmail");
  //   setIsAdmin(isAdmin);
  //   setUserEmail(userEmail);
  // }, []);

  // const { history } = props;

  return (
    <div className="app">
      {/* <div className="navigation">
        {location.pathname !== "/sign-up" && location.pathname !== "/login" && (
          <Header />
        )}
      </div> */}

      <div className="content">
        <Routes>
          {/* <Route exact path="/" element={<HomePage />} /> */}
          <Route path="login" element={<Login />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks/new" element={<div>Add New Task Form</div>} />

          {/* <Route path="home" element={<HomePage />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
