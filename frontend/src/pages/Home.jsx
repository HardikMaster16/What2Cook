
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import api from "../services/api";
import IngredientSelector from "../components/recipe/IngredientSelector";
import RecipeCard from "../components/recipe/RecipeCard";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState([]);
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [minMatch, setMinMatch] = useState(0);

  const pantrySearchHandled = useRef(false);

  // Load available cuisines.
  const { data: cuisinesResponse } = useQuery({
    queryKey: ["recipe-cuisines"],
    queryFn: async () => {
      const response = await api.get("/recipes/cuisines");
      return response.data;
    },
  });

  // Load available categories.
  const { data: categoriesResponse } = useQuery({
    queryKey: ["recipe-categories"],
    queryFn: async () => {
      const response = await api.get("/recipes/categories");
      return response.data;
    },
  });

  const cuisines = Array.isArray(cuisinesResponse?.data)
    ? cuisinesResponse.data.filter(Boolean).sort()
    : [];

  const categories = Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data.filter(Boolean).sort()
    : [];

  // Get recipe recommendations.
  const recommendationMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/recipes/recommend", payload);
      return response.data;
    },
  });

  const results =
    recommendationMutation.data?.data?.recommendations ??
    recommendationMutation.data?.data ??
    recommendationMutation.data?.recommendations ??
    [];

  const recipes = Array.isArray(results) ? results : [];
  const hasSearched = recommendationMutation.isSuccess;

  // Run a recommendation search with the supplied ingredients.
  const findRecipes = (ingredientsToSearch = ingredients) => {
    if (
      !Array.isArray(ingredientsToSearch) ||
      ingredientsToSearch.length === 0
    ) {
      return;
    }

    recommendationMutation.mutate({
      ingredients: ingredientsToSearch,
      cuisine,
      category,
      minMatch,
      limit: 20,
    });
  };

  // Receive pantry ingredients and automatically search once.
  useEffect(() => {
    const pantryIngredients = location.state?.pantryIngredients;

    if (
      !Array.isArray(pantryIngredients) ||
      pantryIngredients.length === 0 ||
      pantrySearchHandled.current
    ) {
      return;
    }

    pantrySearchHandled.current = true;

    const uniqueIngredients = [
      ...new Map(
        pantryIngredients
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => [item.trim().toLowerCase(), item.trim()])
      ).values(),
    ];

    if (uniqueIngredients.length === 0) return;

    setIngredients(uniqueIngredients);

    recommendationMutation.mutate({
      ingredients: uniqueIngredients,
      cuisine: "",
      category: "",
      minMatch: 0,
      limit: 20,
    });

    // Remove the navigation state so it isn't reused on a later visit.
    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.state, location.pathname, navigate]);

  const handleFindRecipes = () => {
    if (ingredients.length === 0) return;
    findRecipes(ingredients);
  };

  const handleCuisineChange = (value) => {
    setCuisine(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleMinimumMatchChange = (event) => {
    setMinMatch(Number(event.target.value));
  };

  const clearFilters = () => {
    setCuisine("");
    setCategory("");
    setMinMatch(0);
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero and ingredient finder */}
      <section className="px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-papaya px-4 py-2 text-sm font-semibold text-walnut">
              <Sparkles size={16} />
              Start with what you have
            </div>

            <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              What do you have in your kitchen?
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-ink/65">
              Turn the ingredients you already have into something
              delicious. Add what's in your kitchen and we'll find matching
              recipes.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            {/* Ingredient selector */}
            <div className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm shadow-walnut/5 sm:p-6">
              <label
                htmlFor="ingredient"
                className="mb-3 block text-sm font-semibold text-ink"
              >
                Add your ingredients
              </label>

              <IngredientSelector
                ingredients={ingredients}
                onChange={setIngredients}
              />

              {ingredients.length === 0 && (
                <p className="mt-3 text-xs text-ink/50">
                  Try ingredients such as chicken, tomato, onion, or garlic.
                </p>
              )}
            </div>

            {/* Cuisine and category */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="home-cuisine"
                  className="mb-2 block text-sm font-medium text-ink/70"
                >
                  Cuisine (optional)
                </label>

                <select
                  id="home-cuisine"
                  value={cuisine}
                  onChange={(event) =>
                    handleCuisineChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-walnut focus:ring-2 focus:ring-coral/25"
                >
                  <option value="">All cuisines</option>

                  {cuisines.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="home-category"
                  className="mb-2 block text-sm font-medium text-ink/70"
                >
                  Category (optional)
                </label>

                <select
                  id="home-category"
                  value={category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm outline-none transition focus:border-walnut focus:ring-2 focus:ring-coral/25"
                >
                  <option value="">All categories</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minimum match slider */}
            <div className="mt-4 rounded-2xl border border-walnut/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="minimum-match"
                  className="flex items-center gap-2 text-sm font-medium text-ink"
                >
                  <SlidersHorizontal size={17} />
                  Minimum recipe match
                </label>

                <span className="rounded-full bg-papaya px-3 py-1.5 text-sm font-semibold text-walnut">
                  {minMatch}%
                </span>
              </div>

              <input
                id="minimum-match"
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatch}
                onChange={handleMinimumMatchChange}
                className="mt-5 w-full cursor-pointer accent-walnut"
              />

              <div className="mt-2 flex justify-between text-xs text-ink/50">
                <span>Show all matches</span>
                <span>Only exact matches</span>
              </div>
            </div>

            {/* Find recipes */}
            <button
              type="button"
              onClick={handleFindRecipes}
              disabled={
                ingredients.length === 0 ||
                recommendationMutation.isPending
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-4 font-semibold text-papaya transition hover:bg-walnut-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recommendationMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}

              {recommendationMutation.isPending
                ? "Finding recipes..."
                : "Find My Recipes"}
            </button>

            {recommendationMutation.isError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {recommendationMutation.error?.response?.data?.message ||
                  "Unable to find recipes. Please check your connection and try again."}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {hasSearched && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
                Your results
              </p>

              <h2 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                {recipes.length}{" "}
                {recipes.length === 1 ? "recipe" : "recipes"} to explore
              </h2>

              <p className="mt-2 text-sm text-ink/60">
                Based on your selected ingredients
                {minMatch > 0
                  ? ` and a minimum match of ${minMatch}%.`
                  : "."}
              </p>
            </div>

            <Link
              to="/recipes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-walnut transition hover:text-walnut-dark"
            >
              Browse all recipes
              <ArrowRight size={17} />
            </Link>
          </div>

          {recipes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-walnut/10 bg-white px-6 py-14 text-center">
              <ChefHat
                size={42}
                className="mx-auto text-walnut/40"
                strokeWidth={1.5}
              />

              <h3 className="mt-4 text-xl font-bold text-ink">
                No matching recipes found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
                Try lowering the minimum match percentage, changing your
                filters, or adding more ingredients.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-walnut px-5 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* Intro section before the first search */}
      {!hasSearched && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-walnut/10 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-papaya text-walnut">
              <ChefHat size={28} />
            </div>

            <h2 className="font-display mt-5 text-2xl font-semibold text-ink">
              Your next meal starts here
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/60">
              Select the ingredients you already have. We'll compare them with
              our recipe collection and show you what you can make.
            </p>

            <Link
              to="/recipes"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-walnut/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-walnut hover:text-walnut"
            >
              Explore all recipes
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
