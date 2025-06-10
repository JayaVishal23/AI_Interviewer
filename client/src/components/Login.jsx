import React, { useState } from "react";
import "./CSS/login.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [text, setText] = useState({
    username: "",
    password: "",
    email: "",
    confirmPass: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const forgotPassClick = () => {
    toast.error("Can't you remember your password?? Create new account man!!");
  };

  const setLoginSignup = () => {
    setLogin(!login);
  };

  const showPass = () => {
    setShowPassword(!showPassword);
  };

  const submitData = async () => {
    setLoading(true);

    if (!login && text.password != text.confirmPass) {
      toast.error("Passwords are not same");
      return;
    }
    const url = login
      ? `${backend}/authenticate/login`
      : `${backend}/authenticate/signup`;

    const fields = login
      ? {
          username: text.username,
          password: text.password,
        }
      : {
          username: text.username,
          password: text.password,
          email: text.email,
        };
    try {
      const res = await axios.post(url, fields, {
        withCredentials: true,
      });
      setLoading(false);
      toast.success(login ? "Login Successful" : "Signup Successful");
      {
        login
          ? (navigate("/home"),
            setText({
              username: "",
              password: "",
              email: "",
              confirmPass: "",
            }))
          : (setLogin(true),
            setText({
              username: "",
              password: "",
              email: "",
              confirmPass: "",
            }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);

      console.log(err);
    }
  };

  return (
    <div className="container cont-login">
      <div className="login-page">
        <h1 className="main-head">AI Interview</h1>
        <div className="login-form">
          {login ? (
            <p className="login-head">Login</p>
          ) : (
            <p className="login-head">SignUp</p>
          )}
          {!login && (
            <input
              type="email"
              placeholder="Enter Email"
              className="email-inp username-inp"
              value={text.email}
              onChange={(e) => setText({ ...text, email: e.target.value })}
            />
          )}
          <input
            type="text"
            placeholder="Enter username"
            className="username-inp"
            value={text.username}
            onChange={(e) => setText({ ...text, username: e.target.value })}
          />
          {login ? (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="pass-inp"
              value={text.password}
              onChange={(e) => setText({ ...text, password: e.target.value })}
            />
          ) : (
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter pass"
                className="pass-inp pass-inp-sign"
                value={text.password}
                onChange={(e) => setText({ ...text, password: e.target.value })}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm pass"
                className="pass-inp pass-inp-sign confirm-pass"
                value={text.confirmPass}
                onChange={(e) =>
                  setText({ ...text, confirmPass: e.target.value })
                }
              />
            </div>
          )}

          <span className="show-pass">
            <input type="checkbox" onClick={showPass} />
            Show password
          </span>

          <button className="login-btn" onClick={submitData}>
            {login ? "Login" : "Signup"}
          </button>
          <span className="sinup-link" onClick={setLoginSignup}>
            {login ? (
              <p>Or new to AI Interview? - Signup</p>
            ) : (
              <p>Already have account? Login</p>
            )}
          </span>
          {login && (
            <span className="forgot-pass" onClick={forgotPassClick}>
              Forgot password?
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
