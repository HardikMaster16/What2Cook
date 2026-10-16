import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import { getRecommendations } from "../services/recommendationService.js";

const getRecipes = async (req, res) => {
  try {
    const {
      search = "",
      cuisine = "",
      category = "",
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const query = {};

    if (search.trim()) {
      query.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (cuisine.trim()) {
      query.cuisine = {
        $regex: `^${cuisine.trim()}$`,
        $options: "i",
      };
    }

    if (category.trim()) {
      query.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }

    const total = await Recipe.countDocuments(query);

    const recipes = await Recipe.find(query)
      .select(
        "title image cuisine category ingredients ingredientNames instructions prepTime cookTime servings difficulty"
      )
      .sort({ title: 1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();

    const totalPages = Math.ceil(total / perPage);

    res.status(200).json({
      success: true,
      count: recipes.length,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      data: recipes,
    });
  } catch (error) {
    console.error("Get recipes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes.",
    });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });
    }

    const recipe = await Recipe.findById(id)
      .select(
        "title image cuisine category ingredients ingredientNames instructions prepTime cookTime servings difficulty source sourceUrl"
      )
      .lean();

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
    console.error("Get recipe by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recipe.",
      error: error.message,
    });
  }
};

const recommendRecipes = async (req, res) => {
  try {
    const {
      ingredients = [],
      cuisine = "",
      category = "",
      minMatch = 0,
      limit = 20,
    } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient.",
      });
    }

    const recommendations = await getRecommendations({
      ingredients,
      cuisine,
      category,
      minMatch,
      limit,
    });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recipe recommendation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate recipe recommendations.",
    });
  }
};

const getCuisines = async (req, res) => {
  try {
    const cuisines = await Recipe.distinct("cuisine");

    const filteredCuisines = cuisines
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      count: filteredCuisines.length,
      data: filteredCuisines,
    });
  } catch (error) {
    console.error("Get cuisines error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cuisines.",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Recipe.distinct("category");

    const filteredCategories = categories
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      count: filteredCategories.length,
      data: filteredCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
};

export {
  getRecipes,
  getRecipeById,
  getCuisines,
  getCategories,
  recommendRecipes,
};