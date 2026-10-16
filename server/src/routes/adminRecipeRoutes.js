
import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
  getAdminRecipes,
  getAdminRecipeById,
  createAdminRecipe,
  updateAdminRecipe,
  deleteAdminRecipe,
} from "../controllers/adminRecipeController.js";

const router = express.Router();

// Every route in this file requires an authenticated administrator.
router.use(protect, adminOnly);

router.get("/", getAdminRecipes);
router.get("/:id", getAdminRecipeById);
router.post("/", createAdminRecipe);
router.put("/:id", updateAdminRecipe);
router.delete("/:id", deleteAdminRecipe);

export default router;
