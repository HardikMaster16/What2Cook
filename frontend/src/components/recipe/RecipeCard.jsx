
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, ChefHat, Heart } from "lucide-react";

function RecipeCard({ recipe, onFavorite, isFavorite = false }) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasMatchData =
    typeof recipe.matchPercentage === "number" &&
    Array.isArray(recipe.availableIngredients) &&
    Array.isArray(recipe.missingIngredients);

  const availableIngredients = recipe.availableIngredients ?? [];
  const missingIngredients = recipe.missingIngredients ?? [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-walnut/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-walnut/10">
      {/* Recipe image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-papaya/60">
        {recipe.image && !imageFailed ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-walnut/40">
            <ChefHat size={32} strokeWidth={1.5} />
            <span className="text-xs font-medium">No image available</span>
          </div>
        )}

        {/* Match badge: only for actual recommendation results */}
        {hasMatchData && (
          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-walnut shadow-sm">
            {recipe.matchPercentage}% match
          </div>
        )}

        {/* Favorite button */}
        {onFavorite && (
          <button
            type="button"
            onClick={() => onFavorite(recipe)}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink/50 shadow-sm transition hover:text-coral-dark"
          >
            <Heart
              size={19}
              className={isFavorite ? "fill-coral-dark text-coral-dark" : ""}
            />
          </button>
        )}
      </div>

      {/* Recipe information */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-ink/50">
          {recipe.cuisine && <span>{recipe.cuisine}</span>}

          {recipe.cuisine && recipe.category && <span>·</span>}

          {recipe.category && <span>{recipe.category}</span>}
        </div>

        <h3 className="line-clamp-2 min-h-14 text-lg font-bold text-ink">
          {recipe.title}
        </h3>

        {/* Recommendation information */}
        {hasMatchData ? (
          <>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
                You have ({availableIngredients.length})
              </p>

              {availableIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {availableIngredients.slice(0, 4).map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center gap-1 rounded-full bg-sand/30 px-2.5 py-1 text-xs text-walnut"
                    >
                      <Check size={12} />
                      {ingredient}
                    </span>
                  ))}

                  {availableIngredients.length > 4 && (
                    <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-ink/60">
                      +{availableIngredients.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink/50">
                  No matching ingredients
                </p>
              )}
            </div>

            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">
                Still needed
              </p>

              {missingIngredients.length > 0 ? (
                <p className="line-clamp-2 text-sm text-ink/60">
                  {missingIngredients.slice(0, 3).join(", ")}
                  {missingIngredients.length > 3
                    ? ` +${missingIngredients.length - 3} more`
                    : ""}
                </p>
              ) : (
                <p className="text-sm font-medium text-walnut">
                  You have everything!
                </p>
              )}
            </div>
          </>
        ) : (
          /* General browsing card */
          <div className="mt-4 flex-1">
            <p className="text-sm leading-6 text-ink/50">
              Explore the ingredients and cooking instructions for this recipe.
            </p>
          </div>
        )}

        {/* Details link */}
        <Link
          to={`/recipes/${recipe._id}`}
          className="mt-5 flex w-full items-center justify-between rounded-xl bg-walnut px-4 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
        >
          View Recipe
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

export default RecipeCard;
