const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/history.js");

router.post("/v1/history", create);

router.get("/v1/history", list);

router.put("/v1/history", update);

router.delete("/v1/history/:slug", remove);

module.exports = router;
