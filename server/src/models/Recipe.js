import mongoose from "mongoose";

const recipeIngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    measure: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const recipeSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    cuisine: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    ingredients: {
      type: [recipeIngredientSchema],
      required: true,
    },

    ingredientNames: {
      type: [String],
      default: [],
      index: true,
    },

    instructions: {
      type: [String],
      default: [],
    },

    prepTime: {
      type: Number,
      default: null,
      min: 0,
    },

    cookTime: {
      type: Number,
      default: null,
      min: 0,
    },

    servings: {
      type: Number,
      default: null,
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", null],
      default: null,
    },

    source: {
      type: String,
      default: "themealdb",
      trim: true,
    },

    sourceUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({
  title: "text",
  cuisine: "text",
  category: "text",
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;