import { useState } from "react";
import { Plus, X } from "lucide-react";

function IngredientSelector({ ingredients, onChange }) {
  const [input, setInput] = useState("");

  const addIngredient = () => {
    const value = input.trim();

    if (!value) return;

    const exists = ingredients.some(
      (ingredient) =>
        ingredient.toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      setInput("");
      return;
    }

    onChange([...ingredients, value]);
    setInput("");
  };

  const removeIngredient = (ingredientToRemove) => {
    onChange(
      ingredients.filter(
        (ingredient) => ingredient !== ingredientToRemove
      )
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addIngredient();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          id="ingredient"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. chicken, tomato, onion..."
          className="min-w-0 flex-1 rounded-xl border border-walnut/20 px-4 py-3 text-sm outline-none transition focus:border-walnut focus:ring-2 focus:ring-coral/25"
        />

        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center gap-2 rounded-xl bg-walnut px-4 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {ingredients.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-1.5 rounded-full bg-blush/40 px-3 py-1.5 text-sm font-medium text-walnut"
            >
              {ingredient}

              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                className="rounded-full p-0.5 transition hover:bg-walnut/10"
                aria-label={`Remove ${ingredient}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {ingredients.length === 0 && (
        <p className="mt-3 text-xs text-ink/50">
          Add at least one ingredient to find recipes.
        </p>
      )}
    </div>
  );
}

export default IngredientSelector;
