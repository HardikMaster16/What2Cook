
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import { normalizeIngredientName } from "../services/recipeNormalizer.js";

// Create an error that represents invalid client input.
const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

// Escape special characters when searching recipe titles.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Convert request data into a validated recipe document payload.
const buildRecipeData = (body, existingRecipe = null) => {
  const title =
    typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    throw validationError("Recipe title is required.");
  }

  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    throw validationError("At least one ingredient is required.");
  }

  const ingredients = body.ingredients.map((ingredient) => {
    if (
      !ingredient ||
      typeof ingredient.name !== "string" ||
      !ingredient.name.trim()
    ) {
      throw validationError("Every ingredient must have a name.");
    }

    const name = ingredient.name.trim();
    const normalizedName = normalizeIngredientName(name);

    if (!normalizedName) {
      throw validationError("Every ingredient must have a valid name.");
    }

    return {
      name,
      normalizedName,
      measure:
        typeof ingredient.measure === "string"
          ? ingredient.measure.trim()
          : "",
    };
  });

  const ingredientNames = [
    ...new Set(ingredients.map((item) => item.normalizedName)),
  ];

  const stringFields = [
    "description",
    "image",
    "cuisine",
    "category",
    "sourceUrl",
  ];

  const data = {
    title,
    ingredients,
    ingredientNames,
  };

  for (const field of stringFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        throw validationError(`${field} must be a string.`);
      }

      data[field] = body[field].trim();
    } else if (existingRecipe) {
      data[field] = existingRecipe[field] ?? "";
    } else {
      data[field] = "";
    }
  }

  if (!Array.isArray(body.instructions)) {
    throw validationError("Instructions must be an array.");
  }

  if (
    body.instructions.some(
      (instruction) => typeof instruction !== "string"
    )
  ) {
    throw validationError("Every instruction must be a string.");
  }

  data.instructions = body.instructions
    .map((instruction) => instruction.trim())
    .filter(Boolean);

  const numericFields = ["prepTime", "cookTime", "servings"];

  for (const field of numericFields) {
    if (body[field] === undefined && existingRecipe) {
      data[field] = existingRecipe[field] ?? null;
      continue;
    }

    const value = body[field];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      data[field] = null;
      continue;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw validationError(`${field} must be a valid number.`);
    }

    if (numberValue < 0) {
      throw validationError(`${field} cannot be negative.`);
    }

    if (field === "servings" && numberValue < 1) {
      throw validationError("Servings must be at least 1.");
    }

    if (field === "servings" && !Number.isInteger(numberValue)) {
      throw validationError("Servings must be a whole number.");
    }

    data[field] = numberValue;
  }

  if (body.difficulty === undefined && existingRecipe) {
    data.difficulty = existingRecipe.difficulty ?? null;
  } else {
    const difficulty = body.difficulty;

    if (
      difficulty === undefined ||
      difficulty === null ||
      difficulty === ""
    ) {
      data.difficulty = null;
    } else {
      if (
        typeof difficulty !== "string" ||
        !["easy", "medium", "hard"].includes(
          difficulty.toLowerCase()
        )
      ) {
        throw validationError(
          "Difficulty must be easy, medium, hard, or null."
        );
      }

      data.difficulty = difficulty.toLowerCase();
    }
  }

  return data;
};

// Send consistent error responses.
const handleControllerError = (res, error, label) => {
  console.error(`${label}:`, error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A recipe with this unique identifier already exists.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

// GET /api/admin/recipes
export const getAdminRecipes = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const cuisine =
      typeof req.query.cuisine === "string"
        ? req.query.cuisine.trim()
        : "";

    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    const filter = {};

    if (search) {
      filter.title = {
        $regex: escapeRegex(search),
        $options: "i",
      };
    }

    if (cuisine) {
      filter.cuisine = cuisine;
    }

    if (category) {
      filter.category = category;
    }

    const total = await Recipe.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const recipes = await Recipe.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: recipes.length,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      data: recipes,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Admin get recipes error"
    );
  }
};

// GET /api/admin/recipes/:id
export const getAdminRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });
    }

    const recipe = await Recipe.findById(id).lean();

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Admin get recipe error"
    );
  }
};

// POST /api/admin/recipes
export const createAdminRecipe = async (req, res) => {
  try {
    const data = buildRecipeData(req.body);

    const recipe = await Recipe.create({
      ...data,
      externalId: `MANUAL-${randomUUID()}`,
      source: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Recipe created successfully.",
      data: recipe,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Admin create recipe error"
    );
  }
};

// PUT /api/admin/recipes/:id
export const updateAdminRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found.",
      });
    }

    const data = buildRecipeData(req.body, recipe);

    Object.assign(recipe, data);

    // Preserve externalId and source during edits.
    await recipe.save();

    return res.status(200).json({
      success: true,
      message: "Recipe updated successfully.",
      data: recipe,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Admin update recipe error"
    );
  }
};

// DELETE /api/admin/recipes/:id
export const deleteAdminRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });
    }

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recipe deleted successfully.",
      data: recipe,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Admin delete recipe error"
    );
  }
};
