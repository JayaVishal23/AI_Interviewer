import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import User from "../db/userSchema.js";
import Interview from "../db/interviewSchema.js";
import { verifyToken } from "../middleware/protectRoute.js";
import { analyzeAudio } from "./toneAnalyzer.js";
import moment from "moment";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const interviewChats = new Map();
let chat = null;

async function send(input, chat) {
  if (!chat) {
    throw new Error(
      "Chat session not initialized. Please start the interview first."
    );
  }
  const response1 = await chat.sendMessage({
    message: input,
  });
  return response1.text;
}

router.post(
  "/startinterview",
  verifyToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { name, jobTitle, jobDescription } = req.body;

      const resumeData = await pdfParse(req.file.buffer);
      const resumeText = resumeData.text;

      const chatSession = await ai.chats.create({
        model: "gemini-2.0-flash",
        history: [
          {
            role: "model",
            parts: [
              {
                text: `You are a highly experienced technical interviewer named Vishi who has worked at MAANG companies (Meta, Amazon, Apple, Netflix, Google) for over 10 years. You have interviewed thousands of candidates and have deep knowledge of what top-tier companies look for in candidates.
                  You are now going to conduct a mock interview for a candidate named ${name}. The position they are applying for is ${jobTitle}; Job Description: ${jobDescription}; Candidate Resume: ${resumeText};
                  Your task is to:
                  1. Start with a brief welcome and ask the candidate to introduce themselves.
                  2. Ask 10 technical questions relevant to:
                    - The candidate’s resume,
                    - The job description,
                    - Industry standards for this role at MAANG companies.
                  3. Ask 1–2 behavioral questions (e.g., teamwork, conflict, leadership, learning from mistakes).
                  4. After each question, the candidate will respond.
                    - If the response includes emotional state analysis (e.g., Detected Emotional State:…) and if he asks as "please give me feedback please", then only first analyze that and give feedback on their communication tone, delivery, or confidence in 1 lines.
                    - Then evaluate the technical or behavioral content of their answer and provide detailed, constructive feedback.
                    - Finally, generate the next question.
                  5. If the emotional state is not mentioned, skip the feedback.
                  6. Ask follow-up questions if answers are incomplete or unclear.
                  7. At the end, deliver a closing message and ask if the candidate has any questions.
                  8. When the candidate asks for feedback, provide a final evaluation:
                    - Their strengths
                    - Areas of improvement
                    - Overall assessment based on MAANG standards

                  Guidelines:
                  - Maintain a professional and friendly tone.
                  - Do not generate answers for the candidate.
                  - Always wait for the candidate's answer before continuing.
                  - Pay attention to both technical accuracy and delivery style.
                  - Avoid formatting – use plain text only.
                  - Ask in small length and get more from user
                  - dont use any bold, italic or any other type. just give in plain text without quotations also

                  Begin the interview now.
                  `,
              },
            ],
          },
        ],
      });

      const interviewDoc = await Interview.create({
        user: req.user.id,
        Jtitle: jobTitle,
        Jdescription: jobDescription,
        resume: resumeText,
        conversation: [],
      });

      await User.findByIdAndUpdate(req.user.id, {
        $push: { interviews: interviewDoc._id },
      });

      const interviewId = interviewDoc._id.toString();
      interviewChats.set(interviewId, await chatSession);

      res.status(200).json({ message: "ok", interviewId });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/audio",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let { transcript, interviewId, feedback } = req.body;
      let audioResult = "please give me feedback please";
      const audio = req.files?.audio?.[0];
      const video = req.files?.video?.[0];
      // console.log(transcript);
      // console.log(feedback);
      const chat = interviewChats.get(interviewId);
      if (!chat) {
        return res.status(400).json({ message: "Interview not started yet." });
      }

      // if (audio?.buffer && feedback != "false") {
      //   audioResult = await analyzeAudio(audio.buffer);
      //   transcript = audioResult + transcript;
      // }
      const reply = await send(transcript, chat);
      // console.log(reply);

      await Interview.findByIdAndUpdate(interviewId, {
        $push: {
          conversation: [
            { role: "user", message: transcript },
            { role: "model", message: reply },
          ],
        },
      });

      res.status(201).json({ message: reply });
    } catch (err) {
      console.log(err);
    }
  }
);

// router.post("/end", async (req, res) => {
//   let { interviewId, feedback } = req.body;
//   // const chat = interviewChats.get(interviewId);
//   // if (!chat) {
//   //   return res.status(400).json({ message: "Interview not started yet." });
//   // }
//   // const reply = await send(
//   //   `You are an expert technical interviewer and career mentor.
//   //     Based on our previous conversation Your task is to:

//   //     1. **Evaluate each answer**:
//   //       - Identify what was done well.
//   //       - Point out areas of improvement (clarity, structure, depth, relevance, technical accuracy, conciseness).
//   //       - Assign a score out of 10 for each answer.

//   //     2. **Rewrite my answer in a more compelling way** that would:
//   //       - Impress technical recruiters.
//   //       - Show confidence, clarity, and structure.
//   //       - Reflect strong problem-solving and communication skills.

//   //     3. **Give overall feedback at the end**, including:
//   //       - My strengths in this interview.
//   //       - Areas I should work on.
//   //       - Recommended resources or exercises to improve.`,
//   //   chat
//   // );
//   // console.log(reply);

//   interviewChats.delete(interviewId);
//   res.status(200).json({ message: "Interview session ended." });
// });

router.post("/end", async (req, res) => {
  try {
    const { interviewId } = req.body;
    const chat = interviewChats.get(interviewId);

    if (!chat) {
      return res.status(400).json({ message: "Interview not started yet." });
    }

    // Fetch full conversation from DB
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const fullConversation = interview.conversation
      .map(
        (c) =>
          `${c.role === "user" ? "Candidate" : "Interviewer"}: ${c.message}`
      )
      .join("\n");

    // Prompt Gemini for structured feedback
    const feedbackPrompt = `
You are an experienced MAANG interviewer and career mentor.
Analyze the following candidate interview transcript and provide **structured feedback** in this exact format:

1. **Overall Strengths:** (3-4 bullet points, short sentences)
2. **Areas of Improvement:** (3-4 bullet points, actionable)
3. **Technical Skills Evaluation:** (score out of 10, concise explanation)
4. **Communication & Delivery Evaluation:** (score out of 10, concise explanation)
5. **Overall Assessment:** (1-2 sentence summary, friendly tone)
6. **Next Steps / Resources:** (1-2 bullet points, actionable)

Interview Transcript:
${fullConversation}
`;

    const feedbackResponse = await chat.sendMessage({
      message: feedbackPrompt,
    });

    const structuredFeedback = feedbackResponse.text;

    // Save feedback to interview in DB
    await Interview.findByIdAndUpdate(interviewId, {
      feedback: structuredFeedback,
    });

    // Delete chat session
    interviewChats.delete(interviewId);

    // Return feedback to frontend
    res.status(200).json({
      message: "Interview session ended.",
      feedback: structuredFeedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to end interview." });
  }
});

router.get("/getInterviews", verifyToken, async (req, res) => {
  try {
    // console.log(req.user);
    const user = await User.findOne({
      username: req.user.username,
    })
      .select("-password")
      .populate("interviews");

    // console.log(interviews);
    const filteredInterviews = user.interviews.filter(
      (interview) => interview.conversation && interview.conversation.length > 0
    );
    const interviewSummaries = filteredInterviews.map((interview) => ({
      Jtitle: interview.Jtitle,
      conversation: interview.conversation,
      createdAt: interview.createdAt,
      time: moment(interview.createdAt).format("hh:mm A"),
      date: moment(interview.createdAt).format("YYYY-MM-DD"),
    }));
    // console.log(interviewSummaries);
    res.json(interviewSummaries);
  } catch (err) {
    console.log(err);
  }
});

export default router;
