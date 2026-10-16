
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../services/api";
import ConfirmDialog from "../components/common/ConfirmDialog";

const EMPTY_FORM = {
  ingredientName: "",
  quantity: "1",
  unit: "pieces",
};

function Pantry() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [formError, setFormError] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load pantry items for the authenticated user.
  const {
    data: pantryResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pantry"],
    queryFn: async () => {
      const response = await api.get("/pantry");
      return response.data;
    },
  });

  const pantryItems =
    pantryResponse?.data?.items ??
    pantryResponse?.data ??
    pantryResponse?.items ??
    [];

  const safeItems = Array.isArray(pantryItems) ? pantryItems : [];

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return safeItems;

    return safeItems.filter((item) =>
      (item.ingredientName ?? item.name ?? "")
        .toLowerCase()
        .includes(term)
    );
  }, [safeItems, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingItem(null);
    setFormError("");
  };

  // Add or update an ingredient.
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        return api.put(`/pantry/${editingItem._id}`, payload);
      }

      return api.post("/pantry", payload);
    },
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
    onError: (mutationError) => {
      setFormError(
        mutationError?.response?.data?.message ||
          "Could not save this ingredient. Please try again."
      );
    },
  });

  // Delete an ingredient.
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => api.delete(`/pantry/${itemId}`),
    onSuccess: () => {
      setItemToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      ingredientName: item.ingredientName ?? item.name ?? "",
      quantity: String(item.quantity ?? 1),
      unit: item.unit ?? "pieces",
    });
    setFormError("");
    document.getElementById("pantry-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const ingredientName = form.ingredientName.trim();
    const quantity = Number(form.quantity);
    const unit = form.unit.trim();

    if (!ingredientName) {
      setFormError("Please enter an ingredient name.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError("Quantity must be greater than zero.");
      return;
    }

    if (!unit) {
      setFormError("Please enter a unit.");
      return;
    }

    saveMutation.mutate({
      ingredientName,
      quantity,
      unit,
    });
  };

  const findRecipes = () => {
    const ingredients = [
      ...new Set(
        safeItems
          .map((item) => item.ingredientName ?? item.name ?? "")
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ];

    if (ingredients.length === 0) return;

    // Reuse the existing Home page recommendation flow through URL state.
    navigate("/", {
      state: {
        pantryIngredients: ingredients,
      },
    });
  };

  return (
    <main className="min-h-screen bg-cream">
      <ConfirmDialog
        open={Boolean(itemToDelete)}
        title="Remove this ingredient?"
        message={
          itemToDelete
            ? `Remove "${
                itemToDelete.ingredientName ?? itemToDelete.name
              }" from your pantry?`
            : ""
        }
        confirmText="Remove"
        loading={
          deleteMutation.isPending &&
          deleteMutation.variables === itemToDelete?._id
        }
        onConfirm={() => deleteMutation.mutate(itemToDelete._id)}
        onCancel={() => {
          if (!deleteMutation.isPending) setItemToDelete(null);
        }}
      />

      {/* Header */}
      <section className="border-b border-walnut/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
                Your kitchen
              </p>

              <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                My Pantry
              </h1>

              <p className="mt-3 max-w-xl text-ink/60">
                Keep track of your ingredients and discover what you can cook
                with what you already have.
              </p>
            </div>

            <button
              type="button"
              onClick={findRecipes}
              disabled={safeItems.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya transition hover:bg-walnut-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChefHat size={19} />
              Find Recipes
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-walnut/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-papaya text-walnut">
                <PackageOpen size={22} />
              </div>
              <div>
                <p className="text-sm text-ink/50">Pantry ingredients</p>
                <p className="text-2xl font-bold text-ink">
                  {safeItems.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-walnut/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand/30 text-walnut">
                <ChefHat size={22} />
              </div>
              <div>
                <p className="text-sm text-ink/50">Ready to explore</p>
                <p className="text-sm font-semibold text-ink">
                  Use your pantry to find recipes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add / edit form */}
        <section
          id="pantry-form"
          className="rounded-2xl border border-walnut/10 bg-white p-5 sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {editingItem ? "Edit ingredient" : "Add an ingredient"}
              </h2>
              <p className="mt-1 text-sm text-ink/50">
                Record the ingredient and the amount you have.
              </p>
            </div>

            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
              <div>
                <label
                  htmlFor="ingredient-name"
                  className="mb-2 block text-sm font-medium text-ink/70"
                >
                  Ingredient name
                </label>
                <input
                  id="ingredient-name"
                  type="text"
                  value={form.ingredientName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ingredientName: event.target.value,
                    }))
                  }
                  placeholder="e.g. Chicken, Tomato, Onion"
                  required
                  className="w-full rounded-xl border border-walnut/20 px-4 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
                />
              </div>

              <div>
                <label
                  htmlFor="ingredient-quantity"
                  className="mb-2 block text-sm font-medium text-ink/70"
                >
                  Quantity
                </label>
                <input
                  id="ingredient-quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-xl border border-walnut/20 px-4 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
                />
              </div>

              <div>
                <label
                  htmlFor="ingredient-unit"
                  className="mb-2 block text-sm font-medium text-ink/70"
                >
                  Unit
                </label>
                <select
                  id="ingredient-unit"
                  value={form.unit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      unit: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm outline-none focus:border-walnut focus:ring-2 focus:ring-coral/25"
                >
                  <option value="pieces">Pieces</option>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="l">Litres (l)</option>
                  <option value="cups">Cups</option>
                  <option value="tbsp">Tablespoons</option>
                  <option value="tsp">Teaspoons</option>
                  <option value="cloves">Cloves</option>
                  <option value="packets">Packets</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya transition hover:bg-walnut-dark disabled:opacity-60 lg:w-auto"
                >
                  {saveMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {editingItem ? "Save" : "Add"}
                </button>
              </div>
            </div>

            {formError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {formError}
              </p>
            )}
          </form>
        </section>

        {/* Pantry list */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                Your ingredients
              </h2>
              <p className="mt-1 text-sm text-ink/50">
                Manage the items currently in your pantry.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-walnut/20 bg-white px-3">
              <Search size={18} className="text-ink/40" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pantry..."
                aria-label="Search pantry ingredients"
                className="w-full bg-transparent py-3 text-sm outline-none sm:w-56"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear pantry search"
                  className="text-ink/40 hover:text-ink"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-walnut/10 bg-white py-16">
              <Loader2 size={26} className="animate-spin text-walnut" />
              <span className="ml-3 text-ink/60">
                Loading your pantry...
              </span>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="font-semibold text-red-800">
                Could not load your pantry
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {error?.response?.data?.message ||
                  "Check your connection and try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredItems.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-walnut/10 bg-white">
              <div className="divide-y divide-walnut/10">
                {filteredItems.map((item) => {
                  const itemName = item.ingredientName ?? item.name ?? "Ingredient";
                  const itemId = item._id;

                  return (
                    <div
                      key={itemId}
                      className="flex flex-col gap-4 p-4 transition hover:bg-papaya/20 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-papaya text-walnut">
                          <PackageOpen size={21} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-ink">
                            {itemName}
                          </h3>
                          <p className="mt-1 text-sm text-ink/50">
                            Quantity: {item.quantity ?? 1}{" "}
                            {item.unit ?? "pieces"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          aria-label={`Edit ${itemName}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-walnut/15 bg-white px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-walnut hover:text-walnut"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === itemId
                          }
                          aria-label={`Delete ${itemName}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === itemId ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && !isError && filteredItems.length === 0 && (
            <div className="rounded-2xl border border-walnut/10 bg-white px-6 py-16 text-center">
              <PackageOpen
                size={42}
                strokeWidth={1.5}
                className="mx-auto text-walnut/40"
              />

              <h3 className="mt-4 text-xl font-bold text-ink">
                {search ? "No ingredients found" : "Your pantry is empty"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">
                {search
                  ? "Try another ingredient name or clear your search."
                  : "Add the ingredients you have at home to start discovering recipes you can make."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 font-semibold text-walnut hover:text-walnut-dark"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("ingredient-name")?.focus()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-walnut px-5 py-3 font-semibold text-papaya hover:bg-walnut-dark"
                >
                  <Plus size={18} />
                  Add your first ingredient
                </button>
              )}
            </div>
          )}

          {deleteMutation.isError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {deleteMutation.error?.response?.data?.message ||
                "Could not remove the ingredient. Please try again."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Pantry;
