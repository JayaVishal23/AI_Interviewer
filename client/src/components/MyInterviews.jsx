import React, { useEffect, useRef, useState } from "react";
import "./CSS/myInterviews.css";
import Nav from "./Nav";
import axios from "axios";
import Conversation from "./Conversation";

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [conversation, setConversation] = useState(null);
  const conversationRef = useRef(null);
  const [loading, setloading] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchInterviews = async () => {
      setloading(true);
      try {
        const response = await axios.get(`${backend}/interview/getInterviews`, {
          withCredentials: true,
        });

        setInterviews(response.data);
      } catch (err) {
        console.log(err);
      } finally {
        setloading(false);
      }
    };
    fetchInterviews();
  }, [backend]);

  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="interview-head">
        <p>Your Interviews</p>
        <div className="interview-main">
          {loading ? (
            <div className="loadingv">
              <span className="loader_"></span>
            </div>
          ) : (
            interviews &&
            interviews.map((item, index) => (
              <div
                key={index}
                className="interview-box"
                onClick={() => {
                  setConversation(item.conversation);
                }}
              >
                <h3>
                  {index + 1}. {item.Jtitle}-({item.conversation.length})
                </h3>
                <p>{item.date}</p>
              </div>
            ))
          )}
        </div>
        {conversation && (
          <div className="overlay">
            <div className="popup">
              <Conversation
                data={conversation}
                setConversation={setConversation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterviews;
