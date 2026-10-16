
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Heart,
  Loader2,
  Search,
} from "lucide-react";

import api from "../services/api";
import RecipeCard from "../components/recipe/RecipeCard";

function Favorites() {
  const queryClient = useQueryClient();

  // Fetch the current user's saved recipes.
  const {
    data: favoritesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get("/favorites");
      return response.data;
    },
  });

  // Support the common response shapes used by the API.
  const favorites =
    favoritesResponse?.data?.favorites ??
    favoritesResponse?.data ??
    favoritesResponse?.favorites ??
    [];

  const favoriteItems = Array.isArray(favorites) ? favorites : [];

  // Each favorite may contain a populated recipeId or just a recipe ID.
  const savedRecipes = favoriteItems
    .map((favorite) => {
      const recipe =
        favorite.recipeId && typeof favorite.recipeId === "object"
          ? favorite.recipeId
          : favorite.recipe;

      if (!recipe || typeof recipe !== "object" || !recipe._id) {
        return null;
      }

      return {
        favoriteId: favorite._id,
        recipe: {
          ...recipe,
          // Do not display recommendation data on the Favorites page.
          matchPercentage: undefined,
          availableIngredients: undefined,
          missingIngredients: undefined,
        },
      };
    })
    .filter(Boolean);

  // Remove a saved recipe using its Favorite document ID.
  const removeMutation = useMutation({
    mutationFn: async (favoriteId) => {
      return api.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleRemoveFavorite = (recipe) => {
    const favorite = savedRecipes.find(
      (item) => String(item.recipe._id) === String(recipe._id)
    );

    if (favorite?.favoriteId) {
      removeMutation.mutate(favorite.favoriteId);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <section className="border-b border-walnut/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
              Your collection
            </p>

            <h1 className="font-display mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              <Heart className="fill-coral text-coral" size={31} />
              Favorite Recipes
            </h1>

            <p className="mt-3 text-ink/60">
              Keep your favourite dishes close and ready to cook.
            </p>
          </div>

          <Link
            to="/recipes"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya transition hover:bg-walnut-dark"
          >
            <Search size={18} />
            Explore Recipes
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-walnut/10 bg-white">
            <Loader2 size={28} className="animate-spin text-walnut" />
            <span className="ml-3 text-ink/60">
              Loading your favorite recipes...
            </span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-800">
              Could not load your favorites
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error?.response?.data?.message ||
                "Please check your connection and try again."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Favorites grid */}
        {!isLoading && !isError && savedRecipes.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-ink">
                Your saved recipes
              </h2>

              <p className="mt-2 text-sm text-ink/50">
                {savedRecipes.length}{" "}
                {savedRecipes.length === 1 ? "recipe" : "recipes"} saved
              </p>
            </div>

            {removeMutation.isError && (
              <p role="alert" className="mb-5 text-sm text-red-600">
                {removeMutation.error?.response?.data?.message ||
                  "Could not remove the recipe from your favorites. Please try again."}
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedRecipes.map(({ favoriteId, recipe }) => (
                <div key={favoriteId ?? recipe._id} className="relative">
                  <RecipeCard
                    recipe={recipe}
                    onFavorite={handleRemoveFavorite}
                    isFavorite
                  />

                  {removeMutation.isPending &&
                    removeMutation.variables === favoriteId && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                        <Loader2
                          size={28}
                          className="animate-spin text-walnut"
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!isLoading && !isError && savedRecipes.length === 0 && (
          <div className="rounded-2xl border border-walnut/10 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blush/40 text-coral-dark">
              <Heart size={32} />
            </div>

            <h2 className="font-display mt-5 text-2xl font-semibold text-ink">
              No favorite recipes yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60">
              When you find a recipe you love, tap its heart button to save it
              here. Your personal recipe collection will be ready whenever you
              need it.
            </p>

            <Link
              to="/recipes"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya transition hover:bg-walnut-dark"
            >
              <ChefHat size={18} />
              Discover Recipes
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default Favorites;
