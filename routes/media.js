const express = require("express");
const router = express.Router();
const { create, display } = require("../controllers/media");

router.post("/v1/media", create);
router.get("/v1/media/display", display);

module.exports = router;
