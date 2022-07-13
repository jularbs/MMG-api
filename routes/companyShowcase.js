const express = require("express");
const router = express.Router();
const {
  create,
  update,
  list,
  listByLocation,
  remove,
} = require("../controllers/companyShowcase.js");

router.post("/v1/company-showcase", create);

router.get("/v1/company-showcase", list);
router.get("/v1/company-showcase/:location", listByLocation);

router.put("/v1/company-showcase", update);

router.delete("/v1/company-showcase/:slug", remove);

module.exports = router;
