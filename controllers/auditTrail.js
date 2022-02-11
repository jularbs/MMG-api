const AuditTrail = require("../models/auditTrail");

exports.createEntry = (user, action, payload, req) => {
  const at = new AuditTrail();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  if (user) {
    at.userName = user;
  }

  at.action = action;
  at.payload = payload;
  at.ipAddress = ip;

  at.save();
};

exports.list = (req, res) => {
  const { skip, limit } = req.body;
  AuditTrail.find({})
    .select("userName action payload createdAt ipAddress -_id")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .exec(async (err, result) => {
      if (err)
        res.status(400).json({
          error: "Error occured",
        });

      const count = await AuditTrail.countDocuments();
      res.json({ result, count });
    });
};
