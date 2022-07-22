const express = require("express");
const router = express.Router();
const { create, update, listByLocation, remove } = require("../controllers/testimonial");

router.post("/v1/testimonial", create);

router.get("/v1/testimonial/:location", listByLocation);

router.put("/v1/testimonial", update);

router.delete("/v1/testimonial/:slug", remove);

module.exports = router;
