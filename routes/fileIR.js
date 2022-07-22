const express = require("express");
const router = express.Router();
const { create, update, list, remove, listFilesByCategory } = require("../controllers/fileIR");

router.post("/v1/file-ir", create);

router.get("/v1/file-ir", list);
router.get("/v1/file-ir/:id", listFilesByCategory);

router.put("/v1/file-ir", update);

router.delete("/v1/file-ir/:id", remove);

module.exports = router;
