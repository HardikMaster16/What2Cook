
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChefHat,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  image: "",
  cuisine: "Indian",
  category: "Vegetarian",
  prepTime: "",
  cookTime: "",
  servings: "2",
  difficulty: "easy",
  ingredients: [{ name: "", measure: "" }],
  instructions: [""],
};

const CUISINES = [
  "American",
  "British",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Moroccan",
  "Thai",
  "Turkish",
  "Vietnamese",
];

const CATEGORIES = [
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-walnut/20 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-walnut focus:ring-2 focus:ring-coral/25";

const labelClass = "text-sm font-semibold text-ink/80";

function AddRecipe() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateIngredient = (index, field, value) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, i) =>
        i === index
          ? { ...ingredient, [field]: value }
          : ingredient
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
    setSuccess("");

    const title = form.title.trim();
    const ingredients = form.ingredients
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        measure: ingredient.measure.trim(),
      }))
      .filter((ingredient) => ingredient.name);

    const instructions = form.instructions
      .map((step) => step.trim())
      .filter(Boolean);

    if (!title) {
      setError("Recipe title is required.");
      return;
    }

    if (ingredients.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }

    if (ingredients.length !== form.ingredients.length) {
      setError(
        "Remove empty ingredient rows or enter a name for each ingredient."
      );
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
        "Preparation/cooking times must be zero or greater, and servings must be at least 1."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description: form.description.trim(),
        image: form.image.trim(),
        cuisine: form.cuisine.trim(),
        category: form.category.trim(),
        ingredients,
        instructions,
        prepTime:
          form.prepTime === "" ? null : Number(form.prepTime),
        cookTime:
          form.cookTime === "" ? null : Number(form.cookTime),
        servings:
          form.servings === "" ? null : Number(form.servings),
        difficulty: form.difficulty || null,
      };

      const response = await api.post(
        "/admin/recipes",
        payload
      );

      setSuccess(
        response.data?.message || "Recipe created successfully."
      );

      navigate("/admin/recipes", {
        state: {
          toast: {
            type: "success",
            message: "Recipe created successfully.",
          },
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create the recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/admin/recipes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-walnut"
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
              Add New Recipe
            </h1>

            <p className="mt-2 text-ink/60">
              Add recipe details, ingredients, and cooking instructions.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Basic details */}
          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-ink">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-ink/50">
              Provide the recipe's name and general details.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClass} htmlFor="title">
                  Recipe Title *
                </label>
                <input
                  id="title"
                  required
                  maxLength={150}
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="e.g. Paneer Butter Masala"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  maxLength={2000}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe the recipe..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="image">
                  Recipe Image URL
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
                    onChange={(event) => {
                      updateField("image", event.target.value);
                      setImageFailed(false);
                    }}
                    placeholder="https://example.com/recipe.jpg"
                    className={`${inputClass} pl-10`}
                  />
                </div>

                {form.image.trim() && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-ink/50">
                      Image preview
                    </p>
                    {imageFailed ? (
                      <div className="flex h-40 w-56 items-center justify-center rounded-xl border border-walnut/15 bg-papaya/40 text-walnut/40">
                        <ImageIcon size={28} />
                      </div>
                    ) : (
                      <img
                        src={form.image}
                        alt="Recipe preview"
                        className="h-40 w-56 rounded-xl border border-walnut/15 object-cover"
                        onError={() => setImageFailed(true)}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cuisine">
                    Cuisine
                  </label>
                  <select
                    id="cuisine"
                    value={form.cuisine}
                    onChange={(event) =>
                      updateField("cuisine", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select cuisine</option>
                    {CUISINES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">
                  Ingredients *
                </h2>
                <p className="mt-1 text-sm text-ink/50">
                  Add each ingredient and its quantity.
                </p>
              </div>

              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-semibold text-coral-dark transition hover:bg-blush/20"
              >
                <Plus size={16} />
                Add Ingredient
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 items-end gap-3 rounded-xl border border-walnut/10 p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label
                      className={labelClass}
                      htmlFor={`ingredient-name-${index}`}
                    >
                      Ingredient {index + 1}
                    </label>
                    <input
                      id={`ingredient-name-${index}`}
                      required
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(
                          index,
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Paneer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      className={labelClass}
                      htmlFor={`ingredient-measure-${index}`}
                    >
                      Quantity / Measure
                    </label>
                    <input
                      id={`ingredient-measure-${index}`}
                      value={ingredient.measure}
                      onChange={(event) =>
                        updateIngredient(
                          index,
                          "measure",
                          event.target.value
                        )
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
                    className="flex h-11 items-center justify-center rounded-lg border border-walnut/15 px-3 text-ink/50 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Instructions */}
          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">
                  Cooking Instructions
                </h2>
                <p className="mt-1 text-sm text-ink/50">
                  Add the steps in the order they should be followed.
                </p>
              </div>

              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-semibold text-coral-dark transition hover:bg-blush/20"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {form.instructions.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-walnut/10 p-4"
                >
                  <div className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-papaya text-sm font-bold text-walnut">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <label
                      className={labelClass}
                      htmlFor={`instruction-${index}`}
                    >
                      Step {index + 1}
                    </label>
                    <textarea
                      id={`instruction-${index}`}
                      rows={2}
                      value={step}
                      onChange={(event) =>
                        updateInstruction(index, event.target.value)
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
                    className="mt-7 rounded-lg p-2 text-ink/50 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Cooking details */}
          <section className="rounded-2xl border border-walnut/10 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-ink">
              Cooking Details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelClass} htmlFor="prepTime">
                  Prep Time (min)
                </label>
                <input
                  id="prepTime"
                  type="number"
                  min="0"
                  step="1"
                  value={form.prepTime}
                  onChange={(event) =>
                    updateField("prepTime", event.target.value)
                  }
                  placeholder="15"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="cookTime">
                  Cook Time (min)
                </label>
                <input
                  id="cookTime"
                  type="number"
                  min="0"
                  step="1"
                  value={form.cookTime}
                  onChange={(event) =>
                    updateField("cookTime", event.target.value)
                  }
                  placeholder="30"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="servings">
                  Servings
                </label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  step="1"
                  value={form.servings}
                  onChange={(event) =>
                    updateField("servings", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="difficulty">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={form.difficulty}
                  onChange={(event) =>
                    updateField("difficulty", event.target.value)
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

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/recipes"
              className="inline-flex items-center justify-center rounded-xl border border-walnut/20 bg-white px-5 py-3 text-sm font-semibold text-ink/70 transition hover:bg-cream"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "Creating Recipe..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddRecipe;
