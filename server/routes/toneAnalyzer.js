import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 });

export async function analyzeAudio(audioBuffer) {
  try {
    const fileBlob = new Blob([audioBuffer], { type: "audio/webm" });

    const myfile = await ai.files.upload({
      file: fileBlob,
      config: { mimeType: "audio/webm" },
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        `Analyze the following interview audio and determine the emotional state of the speaker. Focus on vocal tone and delivery, considering the following features:
        Pitch (high, low, stable, unstable)
        Speech rate (fast, slow, irregular, steady)
        Pauses and breathing (natural, frequent, awkward, deep breaths, sighs)
        Volume (clear, soft, fluctuating, sudden changes)
        Voice shakiness (trembling or stable)
        Use of filler words ("um", "uh", "like", etc.)
        Emotional expressiveness (monotone, expressive, flat)
        Consistency between tone and spoken content
    Output Format:
        Detected Emotional State: [Stressed / Tense / Relaxed]\n
        Confidence Score: [0–100]\n
        Supporting Observations: A one line explanation highlighting vocal features or moments that led to this classification.\n
        How to answer: Provide the answer for the question, you have just asked now.
        Give in plain text. Don't use any bold or italic and dont use any *`,
      ]),
    });
    return response.text;
  } catch (error) {
    console.error("Error during analysis:", error.message);
    return "";
  }
}
