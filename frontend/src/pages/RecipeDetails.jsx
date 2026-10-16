
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  Heart,
  Loader2,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import api from "../services/api";

function RecipeDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [imageFailed, setImageFailed] = useState(false);

  // Load recipe details.
  const {
    data: recipeResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const recipe = recipeResponse?.data ?? recipeResponse?.recipe ?? null;

  // Load favorites for the logged-in user.
  const {
    data: favoritesResponse,
    isError: favoritesError,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get("/favorites");
      return response.data;
    },
    enabled: Boolean(localStorage.getItem("what2cook_token")),
  });

  const favoriteItems =
    favoritesResponse?.data ?? favoritesResponse?.favorites ?? [];

  const favorite = favoriteItems.find((item) => {
    const favoriteRecipe = item.recipeId;

    const favoriteRecipeId =
      typeof favoriteRecipe === "object"
        ? favoriteRecipe?._id
        : favoriteRecipe;

    return (
      String(favoriteRecipeId ?? "") === String(id) ||
      String(item._id ?? "") === String(id)
    );
  });

  const isFavorite = Boolean(favorite);

  // Add or remove a favorite.
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const favoriteId = favorite._id;
        return api.delete(`/favorites/${favoriteId}`);
      }

      return api.post("/favorites", { recipeId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const ingredients = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients
    : [];

  const instructions = Array.isArray(recipe?.instructions)
    ? recipe.instructions.filter(
        (step) => step?.trim() && !/^step\s*\d+$/i.test(step.trim())
      )
    : [];

  const toggleIngredient = (ingredientName) => {
    setCheckedIngredients((current) =>
      current.includes(ingredientName)
        ? current.filter((name) => name !== ingredientName)
        : [...current, ingredientName]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-walnut" />
        <span className="ml-3 text-ink/60">Loading recipe...</span>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ChefHat size={48} className="mx-auto text-walnut/40" />

        <h1 className="mt-5 text-2xl font-bold text-ink">
          Recipe not found
        </h1>

        <p className="mt-3 text-ink/60">
          {error?.response?.data?.message ||
            "We couldn't load this recipe. It may have been removed or the link may be invalid."}
        </p>

        <Link
          to="/recipes"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya hover:bg-walnut-dark"
        >
          <ArrowLeft size={18} />
          Browse recipes
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      {/* Breadcrumb / Back */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition hover:text-walnut"
        >
          <ArrowLeft size={17} />
          Back to recipes
        </Link>
      </div>

      {/* Recipe hero */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-papaya/60">
          {recipe.image && !imageFailed ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              onError={() => setImageFailed(true)}
              className="h-full max-h-[520px] min-h-[280px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-walnut/40">
              <ChefHat size={44} strokeWidth={1.5} />
              <span className="text-sm font-medium">No image available</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {recipe.cuisine && (
              <span className="rounded-full bg-papaya px-3 py-1.5 text-sm font-medium text-walnut">
                {recipe.cuisine}
              </span>
            )}

            {recipe.category && (
              <span className="rounded-full bg-cream px-3 py-1.5 text-sm font-medium text-ink/70">
                {recipe.category}
              </span>
            )}
          </div>

          <h1 className="font-display mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="mt-5 leading-7 text-ink/65">
              {recipe.description}
            </p>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-walnut/10 bg-white p-4">
              <Clock3 size={20} className="text-coral-dark" />
              <p className="mt-3 text-xs text-ink/50">Prep time</p>
              <p className="mt-1 font-semibold text-ink">
                {recipe.prepTime != null
                  ? `${recipe.prepTime} min`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-walnut/10 bg-white p-4">
              <UtensilsCrossed size={20} className="text-coral-dark" />
              <p className="mt-3 text-xs text-ink/50">Cook time</p>
              <p className="mt-1 font-semibold text-ink">
                {recipe.cookTime != null
                  ? `${recipe.cookTime} min`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-2xl border border-walnut/10 bg-white p-4">
              <Users size={20} className="text-coral-dark" />
              <p className="mt-3 text-xs text-ink/50">Servings</p>
              <p className="mt-1 font-semibold text-ink">
                {recipe.servings ?? "Not available"}
              </p>
            </div>
          </div>

          {recipe.difficulty && (
            <p className="mt-4 text-sm text-ink/60">
              Difficulty:{" "}
              <span className="font-semibold capitalize text-ink">
                {recipe.difficulty}
              </span>
            </p>
          )}

          {localStorage.getItem("what2cook_token") && (
            <button
              type="button"
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending || favoritesError}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit ${
                isFavorite
                  ? "border-coral/40 bg-blush/30 text-coral-dark hover:bg-blush/50"
                  : "border-walnut/20 bg-white text-ink hover:border-walnut hover:text-walnut"
              }`}
            >
              {favoriteMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart
                  size={18}
                  className={isFavorite ? "fill-current" : ""}
                />
              )}

              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
          )}

          {favoriteMutation.isError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              Could not update favorites. Please try again.
            </p>
          )}
        </div>
      </section>

      {/* Ingredients and instructions */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        {/* Ingredients */}
        <div className="h-fit rounded-3xl border border-walnut/10 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                Ingredients
              </h2>
              <p className="mt-2 text-sm text-ink/50">
                Check off ingredients as you prepare.
              </p>
            </div>

            <span className="rounded-full bg-papaya px-3 py-1.5 text-sm font-semibold text-walnut">
              {checkedIngredients.length}/{ingredients.length}
            </span>
          </div>

          {ingredients.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {ingredients.map((ingredient, index) => {
                const name =
                  typeof ingredient === "string"
                    ? ingredient
                    : ingredient.name;

                const measure =
                  typeof ingredient === "string"
                    ? ""
                    : ingredient.measure;

                const checked = checkedIngredients.includes(name);

                return (
                  <li key={`${name}-${index}`}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        checked
                          ? "border-sand/60 bg-sand/15"
                          : "border-walnut/10 hover:border-coral/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIngredient(name)}
                        className="mt-1 h-4 w-4 accent-walnut"
                      />

                      <span
                        className={`flex-1 text-sm ${
                          checked
                            ? "text-ink/40 line-through"
                            : "text-ink/80"
                        }`}
                      >
                        {name}
                      </span>

                      {measure && (
                        <span className="text-right text-sm text-ink/50">
                          {measure}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ink/50">
              Ingredient information is not available for this recipe.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-3xl border border-walnut/10 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-ink">
            Cooking instructions
          </h2>

          <p className="mt-2 text-sm text-ink/50">
            Follow the steps below to prepare your recipe.
          </p>

          {instructions.length > 0 ? (
            <ol className="mt-7 space-y-6">
              {instructions.map((step, index) => (
                <li key={`${index}-${step.slice(0, 30)}`} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-papaya text-sm font-bold text-walnut">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm leading-7 text-ink/75">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 text-sm text-ink/50">
              Cooking instructions are not available for this recipe.
            </p>
          )}

          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-walnut hover:text-walnut-dark"
            >
              View original recipe
              <ArrowLeft size={16} className="rotate-180" />
            </a>
          )}
        </div>
      </section>

      {/* Bottom navigation */}
      <section className="border-t border-walnut/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Ready to discover another recipe?
            </h2>
            <p className="mt-1 text-sm text-ink/50">
              Find something delicious with the ingredients you have.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya transition hover:bg-walnut-dark"
          >
            Find recipes
            <ArrowLeft size={17} className="rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RecipeDetails;
