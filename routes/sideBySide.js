const express = require("express");
const router = express.Router();
const {
  create,
  update,
  listByGroupLocation,
  remove,
  listByLocation,
} = require("../controllers/sideBySide");

router.get("/v1/side-by-side/:location", listByLocation);

router.post("/v1/side-by-side", create);

router.put("/v1/side-by-side", update);

router.delete("/v1/side-by-side/:slug", remove);

module.exports = router;
