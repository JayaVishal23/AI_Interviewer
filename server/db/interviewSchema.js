import mongoose from "mongoose";

const interviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Jtitle: {
      type: String,
      required: true,
    },
    Jdescription: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    conversation: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
        },
        message: {
          type: String,
        },
      },
    ],
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
