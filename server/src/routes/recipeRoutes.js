import express from "express";
import {
  getRecipes,
  getRecipeById,
  getCuisines,
  getCategories,
  recommendRecipes,
} from "../controllers/recipeController.js";

const router = express.Router();

router.get("/", getRecipes);
router.get("/cuisines", getCuisines);
router.get("/categories", getCategories);
router.post("/recommend", recommendRecipes);
router.get("/:id", getRecipeById);

export default router;