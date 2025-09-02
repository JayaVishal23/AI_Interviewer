import React from "react";
import "./CSS/myInterviews.css";

const Conversation = ({ data, setConversation }) => {
  return (
    <div className="conversation-box">
      <button className="cls" onClick={() => setConversation(null)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 close-btn"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
      {data.map((item, index) => (
        <div
          key={index}
          className={`item  ${item.role === "user" ? "user" : "model"}`}
        >
          <p className={`role`}>{item.role}</p>
          <p className="msg">{item.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Conversation;
