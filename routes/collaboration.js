const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/collaboration.js");

router.post("/v1/collaboration", create);

router.get("/v1/collaboration", list);

router.put("/v1/collaboration", update);

router.delete("/v1/collaboration/:slug", remove);

module.exports = router;
