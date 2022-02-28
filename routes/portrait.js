const express = require("express");
const router = express.Router();
const {
  create,
  update,
  listByGroupLocation,
} = require("../controllers/portrait");

router.get("/v1/portrait/:group/:location", listByGroupLocation);

router.post("/v1/portrait", create);

router.put("/v1/portrait/:slug", update);

module.exports = router;
