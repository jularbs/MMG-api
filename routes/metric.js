const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/metric");

router.post("/v1/metric", create);

router.get("/v1/metric", list);

router.put("/v1/metric", update);

router.delete("/v1/metric/:slug", remove);

module.exports = router;
