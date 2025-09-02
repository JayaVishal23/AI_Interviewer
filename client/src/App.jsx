import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home";
import Interview from "./components/Interview";
import toast, { Toaster } from "react-hot-toast";
import Recordaudio from "./components/Recordaudio";
import Protectroute from "./components/Protectroute";
import MyInterviews from "./components/MyInterviews";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route
          path="/home"
          element={
            <Protectroute>
              <Home />
            </Protectroute>
          }
        />
        <Route
          path="/interview"
          element={
            <Protectroute>
              <Interview />
            </Protectroute>
          }
        ></Route>
        <Route
          path="/myinterviews"
          element={
            <Protectroute>
              <MyInterviews />
            </Protectroute>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
