import mongoose from "mongoose";
export const generateId = async (Model, prefix, pad = 3) => {
  const counters = mongoose.connection.collection("counters");

  const existing = await counters.findOne({ _id: prefix });
  if (!existing) {
    const all = await Model.find({}, { _id: 1 }).lean();
    const max = all.reduce((m, d) => {
      const n = parseInt(String(d._id).slice(prefix.length), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    await counters.updateOne(
      { _id: prefix },
      { $setOnInsert: { seq: max } },
      { upsert: true }
    );
  }

  const updated = await counters.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  );

  return `${prefix}${String(updated.seq).padStart(pad, "0")}`;
};
