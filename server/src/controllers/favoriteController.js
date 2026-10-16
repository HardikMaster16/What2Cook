import Favorite from "../models/Favorite.js";
import Recipe from "../models/Recipe.js";

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user.userId,
    })
      .populate(
        "recipeId",
        "title image cuisine category ingredients ingredientNames instructions prepTime cookTime servings difficulty"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites.",
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({
        success: false,
        message: "Recipe ID is required.",
      });
    }

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found.",
      });
    }

    const existingFavorite = await Favorite.findOne({
      userId: req.user.userId,
      recipeId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Recipe is already in your favorites.",
      });
    }

    const favorite = await Favorite.create({
      userId: req.user.userId,
      recipeId,
    });

    const populatedFavorite = await favorite.populate(
      "recipeId",
      "title image cuisine category"
    );

    res.status(201).json({
      success: true,
      data: populatedFavorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add favorite.",
    });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const deletedFavorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedFavorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorite removed successfully.",
    });
  } catch (error) {
    console.error("Delete favorite error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove favorite.",
    });
  }
};

export {
  getFavorites,
  addFavorite,
  deleteFavorite,
};