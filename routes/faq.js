const express = require("express");
const router = express.Router();
const { create, update, list, remove, listByLocation } = require("../controllers/faq");

router.post("/v1/faq", create);

router.get("/v1/faq", list);
router.get("/v1/faq/:location", listByLocation);

router.put("/v1/faq", update);

router.delete("/v1/faq/:slug", remove);

module.exports = router;
