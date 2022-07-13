const express = require("express");
const router = express.Router();
const {
  create,
  update,
  list,
  remove,
} = require("../controllers/simpleBusiness");

router.post("/v1/simple-business", create);

router.get("/v1/simple-business", list);

router.put("/v1/simple-business", update);

router.delete("/v1/simple-business/:slug", remove);

module.exports = router;
