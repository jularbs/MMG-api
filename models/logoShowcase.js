const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const logoShowcaseSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    logo: {
      type: ObjectId,
      ref: "Media",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LogoShowcase", logoShowcaseSchema);
