
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import api from "../services/api";
import RecipeCard from "../components/recipe/RecipeCard";

const PAGE_SIZE = 20;

function RecipeCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-walnut/10 bg-white">
      <div className="relative aspect-[4/3] animate-shimmer overflow-hidden bg-papaya/50" />
      <div className="flex-1 space-y-3 p-5">
        <div className="animate-shimmer relative h-3 w-24 overflow-hidden rounded-full bg-cream" />
        <div className="animate-shimmer relative h-5 w-full overflow-hidden rounded-full bg-cream" />
        <div className="animate-shimmer relative h-5 w-2/3 overflow-hidden rounded-full bg-cream" />
        <div className="animate-shimmer relative mt-6 h-11 w-full overflow-hidden rounded-xl bg-cream" />
      </div>
    </div>
  );
}

function Recipes() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input to avoid requesting on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Load cuisines.
  const { data: cuisinesResponse } = useQuery({
    queryKey: ["recipe-cuisines"],
    queryFn: async () => {
      const response = await api.get("/recipes/cuisines");
      return response.data;
    },
  });

  // Load categories.
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

  // Load recipes using the existing GET /api/recipes endpoint.
  const {
    data: recipesResponse,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["recipes", { search, cuisine, category, page }],
    queryFn: async () => {
      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (search) params.search = search;
      if (cuisine) params.cuisine = cuisine;
      if (category) params.category = category;

      const response = await api.get("/recipes", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Support common paginated API response formats.
  const recipes =
    recipesResponse?.data?.recipes ??
    (Array.isArray(recipesResponse?.data) ? recipesResponse.data : []) ??
    [];

  const pagination =
    recipesResponse?.pagination ??
    recipesResponse?.data?.pagination ??
    {};

  const totalPages = Math.max(
    1,
    Number(
      pagination.totalPages ??
        recipesResponse?.totalPages ??
        1
    )
  );

  const totalRecipes =
    pagination.total ??
    pagination.totalRecipes ??
    recipesResponse?.total ??
    recipesResponse?.count ??
    recipes.length;

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCuisine("");
    setCategory("");
    setPage(1);
  };

  const hasFilters = Boolean(search || cuisine || category);

  const changeCuisine = (value) => {
    setCuisine(value);
    setPage(1);
  };

  const changeCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Page heading */}
      <section className="border-b border-walnut/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-papaya text-walnut">
              <ChefHat size={27} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
                Explore and discover
              </p>
              <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Discover Recipes
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl leading-7 text-ink/60">
            Explore recipes from different cuisines, find new dishes to try,
            and discover your next favourite meal.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search and filters */}
        <section className="rounded-2xl border border-walnut/10 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-walnut" />
            <h2 className="font-semibold text-ink">
              Find your next recipe
            </h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* Search */}
            <div>
              <label
                htmlFor="recipe-search"
                className="mb-2 block text-sm font-medium text-ink/70"
              >
                Search recipes
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-walnut/20 px-3 focus-within:border-walnut focus-within:ring-2 focus-within:ring-coral/25">
                <Search size={18} className="shrink-0 text-ink/40" />

                <input
                  id="recipe-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by recipe name..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    aria-label="Clear search"
                    className="text-ink/40 hover:text-ink"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <label
                htmlFor="recipes-cuisine"
                className="mb-2 block text-sm font-medium text-ink/70"
              >
                Cuisine
              </label>

              <select
                id="recipes-cuisine"
                value={cuisine}
                onChange={(event) => changeCuisine(event.target.value)}
                className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
              >
                <option value="">All cuisines</option>
                {cuisines.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="recipes-category"
                className="mb-2 block text-sm font-medium text-ink/70"
              >
                Category
              </label>

              <select
                id="recipes-category"
                value={category}
                onChange={(event) => changeCategory(event.target.value)}
                className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
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

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {search && (
                <span className="rounded-full bg-papaya px-3 py-1 text-xs font-medium text-walnut">
                  Search: {search}
                </span>
              )}

              {cuisine && (
                <span className="rounded-full bg-papaya px-3 py-1 text-xs font-medium text-walnut">
                  Cuisine: {cuisine}
                </span>
              )}

              {category && (
                <span className="rounded-full bg-papaya px-3 py-1 text-xs font-medium text-walnut">
                  Category: {category}
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-walnut"
              >
                <X size={14} />
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Results heading */}
        <section className="mt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
                The recipe collection
              </p>

              <h2 className="font-display mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                {search || cuisine || category
                  ? "Your search results"
                  : "All Recipes"}
              </h2>

              {!isLoading && !isError && (
                <p className="mt-2 text-sm text-ink/50">
                  {totalRecipes} recipes available
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
                </p>
              )}
            </div>

            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-2 text-sm text-ink/50">
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
            >
              <h3 className="font-semibold">Could not load recipes</h3>
              <p className="mt-2 text-sm">
                {error?.response?.data?.message ||
                  "Check that your backend is running and try again."}
              </p>
            </div>
          )}

          {/* Recipe grid */}
          {!isLoading && !isError && recipes.length > 0 && (
            <div
              className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && recipes.length === 0 && (
            <div className="rounded-2xl border border-walnut/10 bg-white px-6 py-16 text-center">
              <ChefHat
                size={42}
                className="mx-auto text-walnut/40"
                strokeWidth={1.5}
              />

              <h3 className="mt-4 text-xl font-bold text-ink">
                No recipes found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
                Try a different search term or remove one of your filters to
                explore more recipes.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-walnut px-5 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && recipes.length > 0 && totalPages > 1 && (
            <nav
              aria-label="Recipe pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-walnut/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-walnut disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <span className="text-sm font-medium text-ink/60">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || isFetching}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-walnut/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-walnut disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

export default Recipes;
