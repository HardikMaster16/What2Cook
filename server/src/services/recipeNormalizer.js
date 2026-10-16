const normalizeIngredientName = (name) => {
  if (!name) return "";

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

const extractIngredients = (meal) => {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim() || "";

    if (!ingredient) continue;

    const normalizedName = normalizeIngredientName(ingredient);

    ingredients.push({
      name: ingredient,
      normalizedName,
      measure,
    });
  }

  return ingredients;
};

const splitInstructions = (instructions) => {
  if (!instructions) return [];

  return instructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter(Boolean);
};

const normalizeMeal = (meal) => {
  const ingredients = extractIngredients(meal);

  return {
    externalId: meal.idMeal,

    title: meal.strMeal?.trim() || "",

    description: "",

    image: meal.strMealThumb || "",

    cuisine: meal.strArea?.trim() || "",

    category: meal.strCategory?.trim() || "",

    ingredients,

    ingredientNames: [
      ...new Set(ingredients.map((item) => item.normalizedName)),
    ],

    instructions: splitInstructions(meal.strInstructions),

    prepTime: null,

    cookTime: null,

    servings: null,

    difficulty: null,

    source: "themealdb",

    sourceUrl: meal.strSource || "",
  };
};

export {
  normalizeIngredientName,
  extractIngredients,
  normalizeMeal,
};