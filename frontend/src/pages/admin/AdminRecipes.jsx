
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import api from "../../services/api";
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const CUISINES = [
  "American", "British", "Chinese", "French", "Greek",
  "Indian", "Italian", "Japanese", "Mexican", "Moroccan",
  "Thai", "Turkish", "Vietnamese",
];

const CATEGORIES = [
  "Beef", "Breakfast", "Chicken", "Dessert", "Lamb",
  "Miscellaneous", "Pasta", "Pork", "Seafood", "Side",
  "Starter", "Vegan", "Vegetarian",
];

function AdminRecipes() {
  const location = useLocation();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const [toast, setToast] = useState(
    () => location.state?.toast || null
  );

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchRecipes = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/recipes", {
          params: {
            page,
            limit: 10,
            search: search.trim(),
            cuisine,
            category,
          },
        });

        const result = response.data;

        setRecipes(result.data || []);
        setPagination(
          result.pagination || {
            page,
            limit: 10,
            total: (result.data || []).length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Unable to load recipes. Please try again.";

        setError(message);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    },
    [search, cuisine, category]
  );

  useEffect(() => {
    fetchRecipes(1);
  }, [fetchRecipes]);

  // Display notifications passed from AddRecipe or EditRecipe.
  useEffect(() => {
    const notification = location.state?.toast;

    if (notification?.message) {
      showToast(
        notification.type || "success",
        notification.message
      );

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [
    location.state,
    location.pathname,
    navigate,
    showToast,
  ]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchRecipes(1);
  };

  const handleRefresh = () => {
    fetchRecipes(pagination.page);
  };

  const requestDelete = (recipe) => {
    setRecipeToDelete(recipe);
  };

  const cancelDelete = () => {
    if (!deletingId) {
      setRecipeToDelete(null);
    }
  };

  const handleDelete = async () => {
    if (!recipeToDelete || deletingId) return;

    const recipe = recipeToDelete;
    setDeletingId(recipe._id);

    try {
      await api.delete(`/admin/recipes/${recipe._id}`);

      setRecipeToDelete(null);

      showToast(
        "success",
        `"${recipe.title}" was deleted successfully.`
      );

      const nextPage =
        recipes.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      await fetchRecipes(nextPage);
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message ||
          "Failed to delete the recipe. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      {/* Notifications */}
      <Toast
        type={toast?.type || "success"}
        message={toast?.message || ""}
        onClose={closeToast}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={Boolean(recipeToDelete)}
        title="Delete this recipe?"
        message={
          recipeToDelete
            ? `Are you sure you want to permanently delete "${recipeToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Recipe"
        cancelText="Cancel"
        loading={Boolean(deletingId)}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-coral-dark">
              <ChefHat size={18} />
              Fresse Administration
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Manage Recipes
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              Create, edit, search, and manage your recipe collection.
            </p>
          </div>

          <Link
            to="/admin/recipes/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 text-sm font-semibold text-papaya shadow-sm transition hover:bg-walnut-dark"
          >
            <Plus size={18} />
            Add Recipe
          </Link>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink/50">
                Total Matching Recipes
              </p>
              <UtensilsCrossed
                className="text-coral-dark"
                size={20}
              />
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">
              {pagination.total}
            </p>
          </div>

          <div className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-ink/50">
              Current Page
            </p>
            <p className="mt-3 text-3xl font-bold text-ink">
              {pagination.totalPages ? pagination.page : 0}
              <span className="ml-2 text-base font-normal text-ink/40">
                / {pagination.totalPages}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-ink/50">
              Recipes on This Page
            </p>
            <p className="mt-3 text-3xl font-bold text-ink">
              {recipes.length}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 rounded-2xl border border-walnut/10 bg-white p-4 shadow-sm sm:p-5">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search recipes..."
                className="w-full rounded-xl border border-walnut/15 py-3 pl-10 pr-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
              />
            </div>

            <select
              value={cuisine}
              onChange={(event) => setCuisine(event.target.value)}
              className="w-full rounded-xl border border-walnut/15 bg-white px-3 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
            >
              <option value="">All cuisines</option>
              {CUISINES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-walnut/15 bg-white px-3 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-walnut px-4 py-3 text-sm font-semibold text-papaya hover:bg-walnut-dark disabled:opacity-60"
              >
                <Search size={16} />
                Search
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh recipes"
                aria-label="Refresh recipes"
                className="inline-flex items-center justify-center rounded-xl border border-walnut/15 px-3 text-ink/60 hover:bg-cream disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </form>
        </div>

        {/* Recipe collection */}
        <div className="overflow-hidden rounded-2xl border border-walnut/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-walnut/10 px-5 py-4">
            <h2 className="font-semibold text-ink">
              Recipe Collection
            </h2>
            <span className="text-xs text-ink/50">
              {pagination.total} matching recipes
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle
                className="animate-spin text-walnut"
                size={32}
              />
              <p className="text-sm text-ink/50">
                Loading recipes...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <AlertCircle
                size={36}
                className="mb-3 text-red-500"
              />
              <p className="font-semibold text-ink">
                Unable to load recipes
              </p>
              <p className="mt-2 max-w-md text-sm text-ink/50">
                {error}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 rounded-xl bg-walnut px-4 py-2 text-sm font-semibold text-papaya hover:bg-walnut-dark"
              >
                Try again
              </button>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <UtensilsCrossed
                size={36}
                className="mb-3 text-walnut/30"
              />
              <h3 className="font-semibold text-ink">
                No recipes found
              </h3>
              <p className="mt-2 max-w-md text-sm text-ink/50">
                Try changing your search or filters, or add a new recipe.
              </p>
              <Link
                to="/admin/recipes/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-walnut px-4 py-2 text-sm font-semibold text-papaya hover:bg-walnut-dark"
              >
                <Plus size={16} />
                Add Recipe
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-cream text-xs uppercase tracking-wide text-ink/50">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Recipe</th>
                      <th className="px-5 py-4 font-semibold">Cuisine</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 text-center font-semibold">
                        Ingredients
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-walnut/10">
                    {recipes.map((recipe) => (
                      <tr
                        key={recipe._id}
                        className="transition hover:bg-papaya/15"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-56 items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-papaya/60">
                              {recipe.image ? (
                                <img
                                  src={recipe.image}
                                  alt={recipe.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <ChefHat
                                    size={22}
                                    className="text-walnut/40"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-ink">
                                {recipe.title}
                              </p>
                              <p className="mt-1 text-xs text-ink/50">
                                {recipe.source || "manual"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-ink/60">
                          {recipe.cuisine || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-ink/60">
                          {recipe.category || "—"}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-ink/60">
                          {recipe.ingredients?.length || 0}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/recipes/${recipe._id}/edit`}
                              title="Edit recipe"
                              aria-label={`Edit ${recipe.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-walnut/15 text-ink/60 hover:border-walnut hover:bg-papaya/40 hover:text-walnut"
                            >
                              <Edit size={16} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => requestDelete(recipe)}
                              disabled={Boolean(deletingId)}
                              title="Delete recipe"
                              aria-label={`Delete ${recipe.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-walnut/15 text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === recipe._id ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-walnut/10 md:hidden">
                {recipes.map((recipe) => (
                  <div key={recipe._id} className="p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-papaya/60">
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ChefHat
                              size={24}
                              className="text-walnut/40"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ink">
                          {recipe.title}
                        </h3>
                        <p className="mt-1 text-xs text-ink/50">
                          {recipe.cuisine || "Unknown cuisine"} ·{" "}
                          {recipe.category || "Uncategorized"}
                        </p>
                        <p className="mt-1 text-xs text-ink/50">
                          {recipe.ingredients?.length || 0} ingredients
                        </p>

                        <div className="mt-3 flex gap-2">
                          <Link
                            to={`/admin/recipes/${recipe._id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-walnut/15 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-cream"
                          >
                            <Edit size={14} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => requestDelete(recipe)}
                            disabled={Boolean(deletingId)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && recipes.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-walnut/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-ink/50">
                Showing{" "}
                {(pagination.page - 1) * pagination.limit + 1}–
                {(pagination.page - 1) * pagination.limit + recipes.length}{" "}
                of {pagination.total} recipes
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading || !pagination.hasPreviousPage}
                  onClick={() => fetchRecipes(pagination.page - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-walnut/15 px-3 py-2 text-sm font-medium text-ink/70 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-2 text-sm text-ink/60">
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={loading || !pagination.hasNextPage}
                  onClick={() => fetchRecipes(pagination.page + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-walnut/15 px-3 py-2 text-sm font-medium text-ink/70 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-ink/40">
          Fresse Admin · Recipe Management
        </p>
      </div>
    </div>
  );
}

export default AdminRecipes;
