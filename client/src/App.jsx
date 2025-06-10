import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home";
import Interview from "./components/Interview";
import toast, { Toaster } from "react-hot-toast";
import Recordaudio from "./components/Recordaudio";

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/interview" element={<Interview />}></Route>
        <Route path="/sample" element={<Recordaudio />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
