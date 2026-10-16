import dotenv from "dotenv";
import connectDB from "../src/config/db.js";

import User from "../src/models/User.js";
import Recipe from "../src/models/Recipe.js";
import PantryItem from "../src/models/PantryItem.js";
import Favorite from "../src/models/Favorite.js";

dotenv.config();

const testDatabase = async () => {
  try {
    await connectDB();

    console.log("\n--- Creating test data ---");

    // 1. Create User
    const user = await User.findOneAndUpdate(
      { email: "dbtest@what2cook.local" },
      {
        name: "Database Test User",
        email: "dbtest@what2cook.local",
        dietaryPreference: "vegetarian",
      },
      {
        new: true,
        upsert: true,
      }
    );

    // 2. Create Recipe
    const recipe = await Recipe.findOneAndUpdate(
      { externalId: "TEST-001" },
      {
        externalId: "TEST-001",
        title: "Test Paneer Curry",
        description: "Test recipe for database verification",
        cuisine: "Indian",
        category: "Vegetarian",

        ingredients: [
          {
            name: "Tomato",
            normalizedName: "tomato",
            measure: "2",
          },
          {
            name: "Paneer",
            normalizedName: "paneer",
            measure: "200g",
          },
        ],

        ingredientNames: ["tomato", "paneer"],

        instructions: [
          "Cut the tomatoes.",
          "Add paneer.",
          "Cook and serve.",
        ],

        source: "test",
      },
      {
        new: true,
        upsert: true,
      }
    );

    // 3. Create Pantry Item
    const pantryItem = await PantryItem.findOneAndUpdate(
      {
        userId: user._id,
        normalizedName: "tomato",
      },
      {
        userId: user._id,
        ingredientName: "Tomato",
        normalizedName: "tomato",
        quantity: 2,
        unit: "piece",
      },
      {
        new: true,
        upsert: true,
      }
    );

    // 4. Create Favorite
    const favorite = await Favorite.findOneAndUpdate(
      {
        userId: user._id,
        recipeId: recipe._id,
      },
      {
        userId: user._id,
        recipeId: recipe._id,
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("\nDatabase test successful.\n");

    console.log("User ID:", user._id);
    console.log("Recipe ID:", recipe._id);
    console.log("Pantry Item ID:", pantryItem._id);
    console.log("Favorite ID:", favorite._id);

    console.log("\nCollections verified:");
    console.log("✓ users");
    console.log("✓ recipes");
    console.log("✓ pantryitems");
    console.log("✓ favorites");

    process.exit(0);
  } catch (error) {
    console.error("\nDatabase test failed:");
    console.error(error);
    process.exit(1);
  }
};

testDatabase();