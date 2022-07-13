const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/categoryIR");

router.post("/v1/category-ir", create);

router.get("/v1/category-ir", list);

router.put("/v1/category-ir", update);

router.delete("/v1/category-ir/:slug", remove);

module.exports = router;
