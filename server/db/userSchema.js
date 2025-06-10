import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    interviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Interview",
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
