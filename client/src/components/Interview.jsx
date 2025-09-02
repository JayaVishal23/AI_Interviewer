import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import "./CSS/interview.css";
import Getwebcam from "./Getwebcam";
import toast from "react-hot-toast";
import Recordaudio from "./Recordaudio";
import { useRef } from "react";
import endImg from "../assets/image1.png";
import mute from "../assets/image2.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Interview = () => {
  const [inpval, setInpval] = useState("");
  const [canRecord, setCanRecord] = useState(true);
  const [includeVideo, setincludeVideo] = useState(false);
  const [includeFeedback, setincludeFeedback] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const utteranceRef = useRef(null);
  const [ending, setEnding] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL;
  // useEffect(() => {
  //   var cam = prompt("Enter allow to access your cam");
  //   if (cam.toLowerCase() == "allow") {
  //     setCamAllow(true);
  //   }
  // }, []);
  useEffect(() => {
    // Load chat messages on mount
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setChatMessages(JSON.parse(savedMessages));
    }
  }, []);

  const handleNewMessage = (aiMessage) => {
    setChatMessages((prevMessages) => {
      const updatedMessages = [
        ...prevMessages,
        { sender: "ai", text: aiMessage },
      ];
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      return updatedMessages;
    });
    handleRecord(true);
    speakMessage(aiMessage);
  };
  useEffect(() => {
    // Load chat messages on mount
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setChatMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    const interviewId = localStorage.getItem("interviewId");
    if (!interviewId) {
      setChatMessages([]);
      localStorage.removeItem("chatMessages");
    }
  }, []);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    if (inputContainerRef.current) {
      inputContainerRef.current.scrollTop =
        inputContainerRef.current.scrollHeight;
    }
  }, [inpval]);

  const navigate = useNavigate();

  const speakMessage = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.pitch = 1; // 0 to 2
      utterance.rate = 2; // 0.1 to 10
      utterance.volume = 1; // 0 to 1
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported in your browser.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
  const handleRecord = (status) => {
    setCanRecord(status);
  };

  const sendinfo = () => {
    console.log("Clicked");
    toast("Press and hold Ctrl to record, then release when done 👆", {
      icon: "👆",
    });
  };

  const endMeeting = async () => {
    if (ending) return;
    setEnding(true);
    try {
      const response = await axios.post(
        `${backend}/interview/end`,
        {
          interviewId: localStorage.getItem("interviewId"),
          feedback: "false",
        },
        { withCredentials: true }
      );
      alert(response.data.message);
    } catch (err) {
      console.error("End meeting error:", err.response?.data || err.message);
      toast.error("Failed to end interview");
    }
  };

  return (
    <div>
      <div>
        <Recordaudio
          inVideo={includeVideo}
          inFeedback={includeFeedback}
          onNewMessage={handleNewMessage}
          handleRecord={handleRecord}
          canRecord={canRecord}
          setInpval={setInpval}
        />
      </div>

      <div>
        <Nav />
        <div className="interview-page">
          <div className="cam-box">
            <Getwebcam />
          </div>
          <div>
            <div className="user-permissions">
              <div>
                <input
                  type="checkbox"
                  checked={includeVideo}
                  onChange={() => setincludeVideo(!includeVideo)}
                />
                <label>Include Video</label>
              </div>
              {/* <div>
                <input
                  type="checkbox"
                  checked={includeFeedback}
                  onChange={() => setincludeFeedback(!includeFeedback)}
                />
                <label className="include-feedback">Include Feedback</label>
              </div> */}
            </div>
            <div className="chat-box">
              <div className="chat-header">
                <button className="chat-foot-stop" onClick={stopSpeaking}>
                  <img src={mute} className="end-img" />
                </button>
                Interview with AI
                <button className="chat-foot-stop" onClick={endMeeting}>
                  <img src={endImg} className="end-img" />
                </button>
              </div>
              <div className="chat-body">
                {chatMessages.length > 0 &&
                  chatMessages[chatMessages.length - 1]?.text && (
                    <div className="message-row ai">
                      <p className="message">
                        {chatMessages[chatMessages.length - 1].text}
                      </p>
                    </div>
                  )}
                {chatMessages.length === 0 && (
                  <div className="message-row ai">
                    <div className="message">
                      <p className="message">
                        Press control to activate mic, after completion press
                        Enter to send answer
                      </p>
                    </div>
                  </div>
                )}
                {!canRecord && <p className="waiting-msg">⏳Recording⏳</p>}
              </div>
              <div className="chat-footer">
                {/* <button className="chat-foot-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 mic-btn"
                    onClick={sendinfo}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                    />
                  </svg>
                  Record
                </button> */}

                <div className="">
                  <div className="chat-input-container" ref={inputContainerRef}>
                    <div className="chat-input-display">
                      {inpval || "Your speech will appear here..."}
                    </div>
                  </div>
                </div>

                {/* <button className="chat-foot-send">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 mic-btn"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
