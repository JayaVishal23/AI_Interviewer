import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import "./CSS/interview.css";
import Getwebcam from "./Getwebcam";
import toast from "react-hot-toast";
import Recordaudio from "./Recordaudio";

const Interview = () => {
  // useEffect(() => {
  //   var cam = prompt("Enter allow to access your cam");
  //   if (cam.toLowerCase() == "allow") {
  //     setCamAllow(true);
  //   }
  // }, []);
  const [inpval, setInpval] = useState("");
  const [recordingStatus, setRecordingStatus] = useState(false);

  const sendinfo = () => {
    console.log("Clicked");
    toast.success("Press and hold Ctrl to record, then release when done 👆", {
      icon: "👆",
    });
  };
  return (
    <div>
      <div>
        <Recordaudio />
      </div>

      <div>
        <Nav />
        <div className="interview-page">
          <div className="cam-box">
            <Getwebcam />
          </div>

          <div className="chat-box">
            <div className="chat-header">Interview with AI</div>
            <div className="chat-body">
              <div className="message-row ai">
                <p className="message">
                  A very good morning to you. Let's begin your interview
                </p>
              </div>
            </div>
            <div className="chat-footer">
              <button className="chat-foot-start">
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
              </button>

              <input
                type="text"
                className="chat-inp"
                placeholder="Press and hold Ctrl to record, then release when done"
                value={inpval}
                onChange={(e) => setInpval(e.target.value)}
                disabled
              />
              <button className="chat-foot-send">
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;
