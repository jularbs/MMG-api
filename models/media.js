const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    bucket: {
      type: String,
      require: true,
    },
    key: { type: String, required: true },
    type: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Media", mediaSchema);
