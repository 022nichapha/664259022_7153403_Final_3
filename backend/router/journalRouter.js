const express = require("express");
const router = express.Router();

const {
  getJournals,
  getJournalById,
  createJournal,
  updateJournal,
  deleteJournal,
} = require("../controller/journalController");

router.get("/", getJournals);
router.get("/:id", getJournalById);
router.post("/", createJournal);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

module.exports = router;
