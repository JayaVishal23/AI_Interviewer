import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toWav from "audiobuffer-to-wav";

const Recordaudio = ({
  inVideo,
  inFeedback,
  onNewMessage,
  handleRecord,
  canRecord,
  setInpval,
}) => {
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const mediaRecorderRefVideo = useRef(null);
  const [recording, setRecording] = useState(false);
  const stopCountRef = useRef(0);
  // const [canRecord, setCanRecord] = useState(true);
  const inVideoRef = useRef(inVideo);
  const inFeedbackRef = useRef(inFeedback);
  const maxRecordingTime = useRef(null);

  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    inVideoRef.current = inVideo;
  }, [inVideo]);
  useEffect(() => {
    inFeedbackRef.current = inFeedback;
  }, [inFeedback]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key == "Control") {
        if (!canRecord) {
          toast.error("Waiting for server response before next recording...");
          return;
        }
        setRecording(true);
        handleRecord(false);
        startRecording();
        speechToText();

        maxRecordingTime.current = setTimeout(() => {
          setRecording(false);
          stopSpeechToText();
          toast("Recording auto-stopped after 5 minute ");
        }, 300000);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key == "Enter") {
        clearTimeout(maxRecordingTime.current);
        maxRecordingTime.current = null;
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
  }, [canRecord]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: inVideoRef.current ? true : false,
      });

      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = handleStop;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      console.log("Started");

      // Video recording if required
      if (inVideoRef.current) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoStreamRef.current = videoStream;

        const mediaRecorderVideo = new MediaRecorder(videoStream);
        videoChunksRef.current = [];
        mediaRecorderVideo.ondataavailable = (e) =>
          videoChunksRef.current.push(e.data);
        mediaRecorderVideo.onstop = handleStop;
        mediaRecorderRefVideo.current = mediaRecorderVideo;
        mediaRecorderVideo.start();
      }
    } catch (err) {
      console.log(err);
      toast.error("Please allow mic and cam permission");

      // Reset recording state since recording failed
      setRecording(false);
      handleRecord(true); // allow next recording
    }
  };

  const handleStop = async () => {
    stopCountRef.current++;

    if (stopCountRef.current < (inVideoRef.current ? 2 : 1)) {
      return;
    }
    stopCountRef.current = 0;
    const audioBlob = new Blob(audioChunksRef.current, {
      type: "audio/webm",
    });

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioCtx = new window.AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const wavData = toWav(audioBuffer);
    const wavBlob = new Blob([wavData], { type: "audio/wav" });

    const formData = new FormData();
    formData.append("audio", wavBlob, "audio.wav");
    formData.append("transcript", transcriptRef.current);
    const interviewId = localStorage.getItem("interviewId");
    formData.append("interviewId", interviewId);
    formData.append("feedback", inFeedback);

    if (inVideoRef.current && videoChunksRef.current.length > 0) {
      const videoBlob = new Blob(videoChunksRef.current, {
        type: "video/webm",
      });
      formData.append("video", videoBlob, "video.webm");
    }

    try {
      const response = await axios.post(
        `${backend}/interview/audio`,
        formData,
        {
          withCredentials: true,
        }
      );

      onNewMessage(response.data.message);
    } catch (err) {
      console.log(err);
      navigate("/home");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (mediaRecorderRefVideo.current) {
      mediaRecorderRefVideo.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
      videoStreamRef.current = null;
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
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          finalTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript);
      transcriptRef.current = finalTranscript;

      if (typeof setInpval === "function") {
        setInpval(finalTranscript);
      }
    };

    recognition.onend = () => {
      if (recording) recognition.start();
      else stopRecording();
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
