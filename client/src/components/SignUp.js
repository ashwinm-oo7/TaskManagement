import React, { Component } from "react";
// import tyreLogo from "../icons/tyrelogo.jpg";
import "../css/signup.css";
import { toast } from "react-toastify";

import {
  FaUserLock,
  FaUser,
  FaLock,
  FaEnvelope,
  FaHome,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default class SignUp extends Component {
  state = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    pinCode: 0,
    age: 0,
    password: "",
    redirectToHome: false,
    otp: "",
    redirectToLogin: false,
    otpSent: false, // Track if OTP is sent
    otpExpired: false, // Track if OTP is expired
    countdown: 60, // Initial countdown value in seconds
    showPassword: false, // Track password visibility
    isProcessing: false,
  };
  componentDidMount() {
    const isLoggedIn = localStorage.getItem("userId");
    if (isLoggedIn) {
      this.setState({ redirectToHome: true });
    }
  }
  startCountdown = () => {
    // Update the countdown timer every second
    this.interval = setInterval(() => {
      // Decrease countdown value by 1 second
      this.setState((prevState) => ({
        countdown: prevState.countdown - 1,
      }));

      // Check if countdown reaches 0
      if (this.state.countdown <= 0) {
        // Stop the countdown
        clearInterval(this.interval);
        // Set OTP as expired
        this.setState({ otpExpired: true });
      }
    }, 1000); // 1000 milliseconds = 1 second
  };

  componentWillUnmount() {
    // Clear the interval when the component is unmounted
    clearInterval(this.interval);
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  togglePasswordVisibility = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  signUp = async (e) => {
    e.preventDefault();
    console.log("HELLLO : ", this.state);
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@])[0-9a-zA-Z@]{8,}$/;

    if (!passwordRegex.test(this.state.password)) {
      toast.info(
        "Password must contain at least 8 characters, including one uppercase, one lowercase, one digit, and one special character '@'."
      );
      return;
    }

    try {
      // Check if email already exists in the database
      const emailExistsResponse = await fetch(
        process.env.REACT_APP_API_URL + "user/emailExists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          },
          body: JSON.stringify({ email: this.state.email }),
        }
      );
      const emailExistsData = await emailExistsResponse.json();

      if (emailExistsData.exists) {
        toast.warning("Email already exists... You can login directly.");
        return;
      }

      if (!passwordRegex.test(this.state.password)) {
        toast.warning(
          "Password must contain at least 8 characters, including one uppercase, one lowercase, one digit, and one special character '@'."
        );
        return;
      }

      // Proceed with signup if email doesn't exist

      const response = await fetch(
        process.env.REACT_APP_API_URL + "user/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          },
          body: JSON.stringify({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            password: this.state.password,
          }),
        }
      );
      this.setState({
        firstName: "",
        lastName: "",
        password: "",
      });
      console.log("response:::::::::::", response);
      if (response.status === 201) {
        this.setState({ otpSent: true });
        this.startCountdown();
        toast.success("Otp send  successfully", 200);

        console.log("Otp send successfully");
        // Redirect or perform any other actions after successful registration
      } else {
        toast.warning("Incorrect Credentials");

        console.error("Failed to register user");
      }
    } catch (error) {
      toast.warning("Something went wrong");

      console.error("Error during user registration:", error);
    }
  };

  verifyOTP = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + "user/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.state.email,
            otp: this.state.otp,
          }),
        }
      );
      this.setState({ isProcessing: true });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.setState({ isProcessing: false });

      if (response.ok) {
        this.setState({ email: "", otp: "" });
        toast.success("OTP verified successfully");
        window.location.href = "http://localhost:3000/login";
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP");
    }
  };

  render() {
    if (this.state.redirectToHome) {
      setTimeout(() => {
        window.location = process.env.REACT_APP_API_URL_FOR_GUI;
      }, 10); // 3000 milliseconds = 3 seconds

      return (
        <div>
          <img
            src="https://i.ibb.co/M23HzTF/9-Qgzvh-Logo-Makr.png"
            alt="Redirecting..."
          />
        </div>
      );
    }
    if (this.state.otpSent && !this.state.otpExpired) {
      return (
        <div>
          {this.state.isProcessing && (
            <div className="overlay">
              <div className="processing-modal">
                <div className="spinner"></div>
                <p>
                  <div className="processing">Processing</div>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </p>
              </div>
            </div>
          )}
          <h2>Enter OTP</h2>
          <form onSubmit={this.verifyOTP}>
            <div className="form-group">
              <p>Time left to verify OTP: {this.state.countdown} seconds</p>
              <label htmlFor="otp">OTP:</label>
              <input
                type="text"
                className="form-control"
                id="otp"
                name="otp"
                value={this.state.otp}
                onChange={this.handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Verify OTP
            </button>
          </form>
        </div>
      );
    }

    if (this.state.otpExpired) {
      this.setState({ otpSent: false });
      window.location.href = "http://localhost:3000/sign-up";
      return (
        <div>
          <h2>OTP Expired</h2>
          <p>
            The OTP has expired.also SignUP expired due to verification Please
            sign up again.
          </p>
          {/* You can use React Router for navigation */}
        </div>
      );
    }

    return (
      // <div className="login-container">
      // <div className="form-wrapper">
      <form className="forms">
        <a href="/">
          <img
            height={100}
            width={100}
            src="https://i.ibb.co/M23HzTF/9-Qgzvh-Logo-Makr.png"
            alt="Tyre Logo"
            className="tyre-logo"
          />
        </a>

        <h3>
          <FaUserLock style={{ marginRight: "5px" }} />
          Sign Up
        </h3>

        <div className="mb-3">
          <label>
            <FaUser style={{ marginRight: "5px" }} />
            First name
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="First name"
            value={this.state.firstName}
            onChange={(e) => this.setState({ firstName: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>
            <FaUser style={{ marginRight: "5px" }} />
            Last name
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Last name"
            value={this.state.lastName}
            onChange={(e) => this.setState({ lastName: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>
            <FaEnvelope style={{ marginRight: "5px" }} />
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            placeholder=" Enter email"
            value={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>
            <FaLock style={{ marginRight: "5px" }} />
            Password
          </label>
          <div className="password-input">
            <input
              type={this.state.showPassword ? "text" : "password"}
              className="form-control"
              placeholder=" Enter password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
            />
            <span
              className="password-toggle"
              onClick={this.togglePasswordVisibility}
            >
              {this.state.showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="d-grid">
          <button className="btn btn-primary" onClick={this.signUp.bind(this)}>
            Sign Up
          </button>
        </div>
        <p className="forgot-password text-right">
          Already registered{" "}
          <a href="/login">
            <FaSignInAlt style={{ marginRight: "5px" }} />
            Login ?
          </a>
        </p>
        <p className="forgot-password text-right">
          <a href="/home">
            <FaHome style={{ marginRight: "5px" }} />
            Home
          </a>
        </p>
      </form>
    );
  }
}
