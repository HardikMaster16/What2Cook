
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChefHat,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

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

const inputClass =
  "mt-2 w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-walnut focus:ring-2 focus:ring-coral/25";

const labelClass = "text-sm font-semibold text-ink/80";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  cuisine: "",
  category: "",
  prepTime: "",
  cookTime: "",
  servings: "",
  difficulty: "easy",
  ingredients: [{ name: "", measure: "" }],
  instructions: [""],
};

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const fetchRecipe = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/admin/recipes/${id}`);
      const recipe = response.data?.data;

      if (!recipe) {
        throw new Error("Recipe data was not returned by the server.");
      }

      setForm({
        title: recipe.title ?? "",
        description: recipe.description ?? "",
        image: recipe.image ?? "",
        cuisine: recipe.cuisine ?? "",
        category: recipe.category ?? "",
        prepTime: recipe.prepTime ?? "",
        cookTime: recipe.cookTime ?? "",
        servings: recipe.servings ?? "",
        difficulty: recipe.difficulty ?? "easy",
        ingredients:
          Array.isArray(recipe.ingredients) &&
          recipe.ingredients.length > 0
            ? recipe.ingredients.map((item) => ({
                name: item.name ?? "",
                measure: item.measure ?? "",
              }))
            : [{ name: "", measure: "" }],
        instructions:
          Array.isArray(recipe.instructions) &&
          recipe.instructions.length > 0
            ? recipe.instructions
            : [""],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this recipe."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateIngredient = (index, field, value) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        { name: "", measure: "" },
      ],
    }));
  };

  const removeIngredient = (index) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateInstruction = (index, value) => {
    setForm((current) => ({
      ...current,
      instructions: current.instructions.map((step, i) =>
        i === index ? value : step
      ),
    }));
  };

  const addInstruction = () => {
    setForm((current) => ({
      ...current,
      instructions: [...current.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    setForm((current) => ({
      ...current,
      instructions: current.instructions.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const ingredients = form.ingredients.map((item) => ({
      name: item.name.trim(),
      measure: item.measure.trim(),
    }));
    const instructions = form.instructions
      .map((step) => step.trim())
      .filter(Boolean);

    if (!title) {
      setError("Recipe title is required.");
      return;
    }

    if (
      ingredients.length === 0 ||
      ingredients.some((item) => !item.name)
    ) {
      setError("Every ingredient must have a name.");
      return;
    }

    const invalidNumber = (value, minimum) =>
      value !== "" &&
      (!Number.isFinite(Number(value)) ||
        Number(value) < minimum);

    if (
      invalidNumber(form.prepTime, 0) ||
      invalidNumber(form.cookTime, 0) ||
      invalidNumber(form.servings, 1)
    ) {
      setError(
        "Times must be zero or greater, and servings must be at least 1."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title,
        description: form.description.trim(),
        image: form.image.trim(),
        cuisine: form.cuisine.trim(),
        category: form.category.trim(),
        ingredients,
        instructions,
        prepTime: form.prepTime === "" ? null : Number(form.prepTime),
        cookTime: form.cookTime === "" ? null : Number(form.cookTime),
        servings: form.servings === "" ? null : Number(form.servings),
        difficulty: form.difficulty || null,
      };

      await api.put(`/admin/recipes/${id}`, payload);

      navigate("/admin/recipes", {
        state: {
          toast: {
            type: "success",
            message: "Recipe updated successfully.",
          },
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update the recipe. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center gap-3 text-ink/60">
        <LoaderCircle size={22} className="animate-spin" />
        Loading recipe details...
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 font-semibold text-red-800">
            <AlertCircle size={20} />
            Unable to load recipe
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={fetchRecipe}
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              to="/admin/recipes"
              className="rounded-xl border border-walnut/20 bg-white px-4 py-2 text-sm font-semibold text-ink/70"
            >
              Back to recipes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/recipes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 hover:text-walnut"
        >
          <ArrowLeft size={17} />
          Back to Recipe Management
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-2xl bg-papaya p-3 text-walnut">
            <ChefHat size={30} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
              Administration
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-ink">
              Edit Recipe
            </h1>
            <p className="mt-2 text-ink/60">
              Update recipe details and save your changes.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <section className="space-y-5 rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-ink">
              Basic Information
            </h2>

            <div>
              <label htmlFor="title" className={labelClass}>
                Recipe Title *
              </label>
              <input
                id="title"
                required
                maxLength={150}
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="image" className={labelClass}>
                Image URL
              </label>
              <div className="relative">
                <ImageIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />
                <input
                  id="image"
                  type="url"
                  value={form.image}
                  onChange={(e) => {
                    updateField("image", e.target.value);
                    setImageFailed(false);
                  }}
                  placeholder="https://example.com/recipe.jpg"
                  className={`${inputClass} pl-10`}
                />
              </div>
              {form.image && (
                imageFailed ? (
                  <div className="mt-3 flex h-40 w-56 items-center justify-center rounded-xl border border-walnut/15 bg-papaya/40 text-walnut/40">
                    <ImageIcon size={28} />
                  </div>
                ) : (
                  <img
                    src={form.image}
                    alt="Recipe preview"
                    className="mt-3 h-40 w-56 rounded-xl border border-walnut/15 object-cover"
                    onError={() => setImageFailed(true)}
                  />
                )
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cuisine" className={labelClass}>
                  Cuisine
                </label>
                <select
                  id="cuisine"
                  value={form.cuisine}
                  onChange={(e) => updateField("cuisine", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select cuisine</option>
                  {[
                    ...new Set([
                      ...CUISINES,
                      ...(form.cuisine ? [form.cuisine] : []),
                    ]),
                  ].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className={labelClass}>
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {[
                    ...new Set([
                      ...CATEGORIES,
                      ...(form.category ? [form.category] : []),
                    ]),
                  ].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">
                Ingredients *
              </h2>
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-semibold text-coral-dark hover:bg-blush/20"
              >
                <Plus size={16} /> Add Ingredient
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.ingredients.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 items-end gap-3 rounded-xl border border-walnut/10 p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label
                      htmlFor={`ingredient-${index}`}
                      className={labelClass}
                    >
                      Ingredient {index + 1}
                    </label>
                    <input
                      id={`ingredient-${index}`}
                      required
                      value={item.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      placeholder="e.g. Paneer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`measure-${index}`}
                      className={labelClass}
                    >
                      Quantity / Measure
                    </label>
                    <input
                      id={`measure-${index}`}
                      value={item.measure}
                      onChange={(e) =>
                        updateIngredient(index, "measure", e.target.value)
                      }
                      placeholder="e.g. 200 g"
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={form.ingredients.length === 1}
                    onClick={() => removeIngredient(index)}
                    aria-label={`Remove ingredient ${index + 1}`}
                    className="flex h-11 items-center justify-center rounded-lg border border-walnut/15 px-3 text-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">
                Cooking Instructions
              </h2>
              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-semibold text-coral-dark hover:bg-blush/20"
              >
                <Plus size={16} /> Add Step
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.instructions.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-walnut/10 p-4"
                >
                  <span className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-papaya text-sm font-bold text-walnut">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor={`instruction-${index}`}
                      className={labelClass}
                    >
                      Step {index + 1}
                    </label>
                    <textarea
                      id={`instruction-${index}`}
                      rows={2}
                      value={step}
                      onChange={(e) =>
                        updateInstruction(index, e.target.value)
                      }
                      placeholder="Describe this cooking step..."
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={form.instructions.length === 1}
                    onClick={() => removeInstruction(index)}
                    aria-label={`Remove step ${index + 1}`}
                    className="mt-7 rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-ink">
              Cooking Details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="prepTime" className={labelClass}>
                  Prep Time (min)
                </label>
                <input
                  id="prepTime"
                  type="number"
                  min="0"
                  step="1"
                  value={form.prepTime}
                  onChange={(e) => updateField("prepTime", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cookTime" className={labelClass}>
                  Cook Time (min)
                </label>
                <input
                  id="cookTime"
                  type="number"
                  min="0"
                  step="1"
                  value={form.cookTime}
                  onChange={(e) => updateField("cookTime", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="servings" className={labelClass}>
                  Servings
                </label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  step="1"
                  value={form.servings}
                  onChange={(e) => updateField("servings", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="difficulty" className={labelClass}>
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={form.difficulty}
                  onChange={(e) =>
                    updateField("difficulty", e.target.value)
                  }
                  className={inputClass}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/recipes"
              className="inline-flex items-center justify-center rounded-xl border border-walnut/20 bg-white px-5 py-3 text-sm font-semibold text-ink/70 hover:bg-cream"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-papaya hover:bg-walnut-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditRecipe;
