import dotenv from "dotenv";
import axios from "axios";

import connectDB from "../src/config/db.js";
import Recipe from "../src/models/Recipe.js";
import { normalizeMeal } from "../src/services/recipeNormalizer.js";

dotenv.config();

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const categories = [
  "Beef",
  "Chicken",
  "Dessert",
  "Lamb",
  "Pasta",
  "Pork",
  "Seafood",
  "Vegetarian",
];

const cuisines = [
  "American",
  "British",
  "Canadian",
  "Chinese",
  "French",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Thai",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMealsByFilter = async (filterType, value) => {
  const endpoint =
    filterType === "category"
      ? `${BASE_URL}/filter.php?c=${encodeURIComponent(value)}`
      : `${BASE_URL}/filter.php?a=${encodeURIComponent(value)}`;

  const response = await axios.get(endpoint);

  return response.data.meals || [];
};

const getMealDetails = async (mealId) => {
  const response = await axios.get(
    `${BASE_URL}/lookup.php?i=${mealId}`
  );

  return response.data.meals?.[0] || null;
};

const importRecipes = async () => {
  try {
    await connectDB();

    console.log("\n====================================");
    console.log("   WHAT2COOK RECIPE IMPORTER");
    console.log("====================================\n");

    const mealIds = new Set();

    // --------------------------------
    // 1. Collect recipes by category
    // --------------------------------

    console.log("Collecting recipes by category...\n");

    for (const category of categories) {
      try {
        const meals = await getMealsByFilter(
          "category",
          category
        );

        meals.forEach((meal) => mealIds.add(meal.idMeal));

        console.log(
          `✓ ${category}: ${meals.length} recipes`
        );
      } catch (error) {
        console.error(
          `✗ ${category}: ${error.message}`
        );
      }
    }

    // --------------------------------
    // 2. Collect recipes by cuisine
    // --------------------------------

    console.log("\nCollecting recipes by cuisine...\n");

    for (const cuisine of cuisines) {
      try {
        const meals = await getMealsByFilter(
          "cuisine",
          cuisine
        );

        meals.forEach((meal) => mealIds.add(meal.idMeal));

        console.log(
          `✓ ${cuisine}: ${meals.length} recipes`
        );
      } catch (error) {
        console.error(
          `✗ ${cuisine}: ${error.message}`
        );
      }
    }

    console.log(
      `\nUnique recipes discovered: ${mealIds.size}`
    );

    // --------------------------------
    // 3. Fetch complete recipe details
    // --------------------------------

    console.log("\nImporting complete recipe details...\n");

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    const ids = [...mealIds];

    for (let i = 0; i < ids.length; i++) {
      const mealId = ids[i];

      try {
        const meal = await getMealDetails(mealId);

        if (!meal) {
          skipped++;
          continue;
        }

        const recipe = normalizeMeal(meal);

        if (
          !recipe.externalId ||
          !recipe.title ||
          recipe.ingredients.length === 0
        ) {
          skipped++;
          continue;
        }

        const existingRecipe = await Recipe.exists({
          externalId: recipe.externalId,
        });

        await Recipe.findOneAndUpdate(
          { externalId: recipe.externalId },
          recipe,
          {
            upsert: true,
            returnDocument: "after",
          }
        );

        if (existingRecipe) {
          updated++;
        } else {
          imported++;
        }

        console.log(
          `[${i + 1}/${ids.length}] ✓ ${recipe.title}`
        );

        // Small delay to avoid hammering the API
        await sleep(100);
      } catch (error) {
        console.error(
          `[${i + 1}/${ids.length}] ✗ Failed: ${mealId}`,
          error.message
        );

        skipped++;
      }
    }

    // --------------------------------
    // 4. Final statistics
    // --------------------------------

    const totalRecipes = await Recipe.countDocuments();

    console.log("\n====================================");
    console.log("       IMPORT COMPLETE");
    console.log("====================================");

    console.log(`New recipes:       ${imported}`);
    console.log(`Updated recipes:   ${updated}`);
    console.log(`Skipped recipes:   ${skipped}`);
    console.log(`MongoDB total:     ${totalRecipes}`);

    console.log("\nRecipe database is ready.");

    process.exit(0);
  } catch (error) {
    console.error("\nRecipe import failed:");
    console.error(error);

    process.exit(1);
  }
};

importRecipes();