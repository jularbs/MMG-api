const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  captchaMiddleware,
  listPendingUsers,
  processApproval,
  requireSignin,
  authMiddleware,
  signout,
  changePassword,
  registeredUsers,
  deleteUser
} = require("../controllers/auth.js");

const { list } = require("../controllers/auditTrail");

router.post("/v1/signup", signup);
router.post("/v1/signin", captchaMiddleware, signin);
router.post(
  "/v1/change-password",
  requireSignin,
  authMiddleware,
  changePassword
);
router.post("/v1/audit-trail/list", requireSignin, authMiddleware, list);


router.get("/v1/signout", signout);
router.get("/v1/pending-users", listPendingUsers);
router.get("/v1/registered-users", registeredUsers);

router.put(
  "/v1/process-approval",
  requireSignin,
  authMiddleware,
  processApproval
);

router.delete("/v1/delete-user", requireSignin, authMiddleware, deleteUser);

module.exports = router;
