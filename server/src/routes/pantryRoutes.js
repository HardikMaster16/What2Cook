import express from "express";
import {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
} from "../controllers/pantryController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPantryItems);
router.post("/", protect, addPantryItem);
router.put("/:id", protect, updatePantryItem);
router.delete("/:id", protect, deletePantryItem);

export default router;