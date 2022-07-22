const express = require("express");
const router = express.Router();
const {
  create,
  update,
  list,
  listByLocation,
  remove,
} = require("../controllers/basicPost.js");

router.post("/v1/basic-post", create);

router.get("/v1/basic-post", list);
router.get("/v1/basic-post/:location", listByLocation);

router.put("/v1/basic-post", update);

router.delete("/v1/basic-post/:slug", remove);

module.exports = router;
