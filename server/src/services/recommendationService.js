import Recipe from "../models/Recipe.js";
import {
  normalizeIngredientName,
} from "./recipeNormalizer.js";


const INGREDIENT_ALIASES = {
  "tomatoes": "tomato",
  "tinned tomatoes": "tomato",
  "canned tomatoes": "tomato",
  "chicken thighs": "chicken",
  "chicken thigh": "chicken",
  "chicken breast": "chicken",
  "chicken breasts": "chicken",
  "red onions": "onion",
  "white onions": "onion",
  "yellow onions": "onion",
  "cloves of garlic": "garlic",
};

const canonicalIngredient = (ingredient) => {
  const normalized = normalizeIngredientName(ingredient);
  return INGREDIENT_ALIASES[normalized] || normalized;
};

const calculateMatch = (recipe, availableIngredients) => {
  const availableSet = new Set(
    availableIngredients.map(canonicalIngredient).filter(Boolean)
  );

  // Prefer the detailed ingredients array when available.
  const recipeIngredients =
    recipe.ingredients?.length > 0
      ? recipe.ingredients.map((item) => item.name)
      : recipe.ingredientNames || [];

  // Deduplicate after alias normalization.
  const uniqueIngredients = [
    ...new Set(recipeIngredients.map(canonicalIngredient).filter(Boolean)),
  ];

  const available = uniqueIngredients.filter((ingredient) =>
    availableSet.has(ingredient)
  );

  const missing = uniqueIngredients.filter(
    (ingredient) => !availableSet.has(ingredient)
  );

  const matchPercentage =
    uniqueIngredients.length === 0
      ? 0
      : Math.round((available.length / uniqueIngredients.length) * 100);

  return {
    matchPercentage,
    availableIngredients: available,
    missingIngredients: missing,
  };
};


const getRecommendations = async ({
  ingredients = [],
  cuisine = "",
  category = "",
  minMatch = 0,
  limit = 20,
}) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  const normalizedIngredients = [
    ...new Set(
      ingredients
        .map(normalizeIngredientName)
        .filter(Boolean)
    ),
  ];

  const query = {};

  if (cuisine) {
    query.cuisine = new RegExp(
      `^${cuisine}$`,
      "i"
    );
  }

  if (category) {
    query.category = new RegExp(
      `^${category}$`,
      "i"
    );
  }

  const recipes = await Recipe.find(query)
    .select(
      "title image cuisine category ingredients ingredientNames instructions prepTime cookTime servings difficulty"
    )
    .lean();

  const recommendations = recipes
    .map((recipe) => {
      const match = calculateMatch(
        recipe,
        normalizedIngredients
      );

      return {
        ...recipe,
        ...match,
      };
    })
    .filter(
      (recipe) =>
        recipe.matchPercentage >= minMatch
    )
    .sort((a, b) => {
      // First: highest match
      if (
        b.matchPercentage !== a.matchPercentage
      ) {
        return (
          b.matchPercentage -
          a.matchPercentage
        );
      }

      // Second: fewer missing ingredients
      if (
        a.missingIngredients.length !==
        b.missingIngredients.length
      ) {
        return (
          a.missingIngredients.length -
          b.missingIngredients.length
        );
      }

      // Third: fewer total ingredients
      return (
        a.ingredientNames.length -
        b.ingredientNames.length
      );
    })
    .slice(0, limit);

  return recommendations;
};

export {
  calculateMatch,
  getRecommendations,
};