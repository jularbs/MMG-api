const express = require("express");
const router = express.Router();
const { create, update, readByTypeLocation } = require("../controllers/hero");

router.post("/v1/hero", create);
router.put("/v1/hero/:slug", update);

router.get("/v1/hero/:type/:location", readByTypeLocation);
module.exports = router;
