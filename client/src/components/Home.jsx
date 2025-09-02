import react from "react";
import "./CSS/home.css";
import { useState } from "react";
import Nav from "./Nav";
import Dragordrop from "./Dragordrop";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [name, setName] = useState("");
  const [Jtitle, setJTitle] = useState("");
  const [Jdescription, setJDescription] = useState("");
  const [file, setFile] = useState(null);

  const backend = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const startInterview = async () => {
    if (!file || !name || !Jtitle || !Jdescription) {
      toast.error("Please fill all the fileds and upload file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("name", name);
    formData.append("jobTitle", Jtitle);
    formData.append("jobDescription", Jdescription);

    try {
      const resp = await axios.post(
        `${backend}/interview/startinterview`,
        formData,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("interviewId", resp.data.interviewId);
    } catch (err) {
      console.log(err);
      toast.error("Error while submitting");
      return;
    } finally {
      navigate("/interview");
    }
  };

  return (
    <div className="home">
      <Nav />
      <p className="home-heading">
        Upload your resume & job description and get instant
        <br />
        AI mock interviews tailored to your profile
      </p>
      <div className="home-page">
        <div className="dropzone-file">
          <Dragordrop setfile={setFile} />
          <div className="job-details-section">
            <div className="inp-sec">
              <label className="text-inp">Enter your Name:</label>
              <input
                type="text"
                placeholder="Enter Your Name"
                className="name-inp"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="inp-sec">
              <label className="text-inp">Enter Job Title:</label>
              <input
                type="text"
                placeholder="Enter Job Title"
                className="name-inp"
                value={Jtitle}
                onChange={(e) => setJTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="job-details">
          <div className="job-descrip">
            {/* <label className="text-inp">Enter Job Description:</label> */}
            <textarea
              placeholder="Enter Job Description"
              rows="12"
              cols="140"
              className="job-des"
              value={Jdescription}
              onChange={(e) => setJDescription(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
      <button className="submit-btn" onClick={startInterview}>
        Start Interview
      </button>
    </div>
  );
};

export default Home;
