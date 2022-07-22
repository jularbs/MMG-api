const express = require("express");
const router = express.Router();
const { create, read, remove } = require("../controllers/option.js");

router.post("/v1/option", create);

router.get("/v1/option/:index", read);

router.delete("/v1/option/:slug", remove);

module.exports = router;
