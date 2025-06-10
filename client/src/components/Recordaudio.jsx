import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const Recordaudio = () => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const audioStreamRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key == "Control") {
        setRecording(true);
        startRecording();
        speechToText();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key == "Control") {
        setRecording(false);
        stopSpeechToText();
        // stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setTimeout(async () => {
          const formData = new FormData();
          formData.append("audio", audioBlob, "record.webm");
          formData.append("transcript", transcriptRef.current);

          try {
            console.log(transcriptRef.current);
            const response = await axios.post(
              `${backend}/interview/audio`,
              formData,
              {
                withCredentials: true,
              }
            );
          } catch (err) {
            console.log(err);
          }
        }, 500);
      };

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      console.log("Started");
    } catch (err) {
      console.log(err);
      toast.error("Please allow mic permission");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  const speechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      transcriptRef.current = speechResult;
      console.log("Transcript: ", speechResult);
    };

    recognition.onend = () => {
      stopRecording();
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return <div></div>;
};

export default Recordaudio;
