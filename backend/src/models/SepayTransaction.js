import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    _id: String,
    body: mongoose.Schema.Types.Mixed,
    orderId: String,
    note: String,
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("SepayTransaction", schema, "SepayTransaction");
