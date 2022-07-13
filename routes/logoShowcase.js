const express = require("express");
const router = express.Router();
const {
  create,
  update,
  list,
  remove,
} = require("../controllers/logoShowcase.js");

router.post("/v1/logo-showcase", create);

router.get("/v1/logo-showcase", list);

router.put("/v1/logo-showcase", update);

router.delete("/v1/logo-showcase/:slug", remove);

module.exports = router;
