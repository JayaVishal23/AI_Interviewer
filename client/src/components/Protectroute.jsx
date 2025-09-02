import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Protectroute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${backend}/authenticate/verify`, {
          withCredentials: true, // ensure cookies are sent
        });
        setAuth(true);
      } catch (err) {
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (auth === null) return <div>Checking Authentication...</div>;

  return auth ? children : navigate("/");
};

export default Protectroute;
