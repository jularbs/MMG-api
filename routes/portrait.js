const express = require("express");
const router = express.Router();
const {
  create,
  update,
  listByLocation,
  remove,
} = require("../controllers/portrait");

router.get("/v1/portrait/:location", listByLocation);

router.post("/v1/portrait", create);

router.put("/v1/portrait", update);

router.delete("/v1/portrait/:slug", remove);

module.exports = router;
