import PantryItem from "../models/PantryItem.js";
import { normalizeIngredientName } from "../services/recipeNormalizer.js";

const getPantryItems = async (req, res) => {
  try {
    const items = await PantryItem.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get pantry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pantry items.",
    });
  }
};

const addPantryItem = async (req, res) => {
  try {
    const { ingredientName, quantity, unit } = req.body;

    if (!ingredientName || !ingredientName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ingredient name is required.",
      });
    }

    const normalizedName = normalizeIngredientName(ingredientName);

    const existingItem = await PantryItem.findOne({
      userId: req.user.userId,
      normalizedName,
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: "Ingredient already exists in your pantry.",
      });
    }

    const pantryItem = await PantryItem.create({
      userId: req.user.userId,
      ingredientName: ingredientName.trim(),
      normalizedName,
      quantity: quantity ?? null,
      unit: unit?.trim() || "",
    });

    res.status(201).json({
      success: true,
      data: pantryItem,
    });
  } catch (error) {
    console.error("Add pantry item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add pantry item.",
    });
  }
};

const updatePantryItem = async (req, res) => {
  try {
    const { ingredientName, quantity, unit } = req.body;

    const updateData = {};

    if (ingredientName !== undefined) {
      if (!ingredientName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Ingredient name cannot be empty.",
        });
      }

      updateData.ingredientName = ingredientName.trim();
      updateData.normalizedName = normalizeIngredientName(ingredientName);
    }

    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }

    if (unit !== undefined) {
      updateData.unit = unit.trim();
    }

    const updatedItem = await PantryItem.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update pantry item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pantry item.",
    });
  }
};

const deletePantryItem = async (req, res) => {
  try {
    const deletedItem = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pantry item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete pantry item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete pantry item.",
    });
  }
};

export {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
};