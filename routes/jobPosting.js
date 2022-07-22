const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/jobPosting");

router.post("/v1/job-posting", create);

router.get("/v1/job-posting", list);

router.put("/v1/job-posting", update);

router.delete("/v1/job-posting/:slug", remove);

module.exports = router;
