const mongoose = require("mongoose");

const auditTrailSchema = new mongoose.Schema(
  {
    userName: { type: String },
    action: { type: String, required: true },
    payload: { type: Object },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
    capped: { size: 20000000, max: 60000, autoIndexId: true },
  }
);

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
