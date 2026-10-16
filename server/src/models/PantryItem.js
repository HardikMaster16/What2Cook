import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ingredientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },

    quantity: {
      type: Number,
      default: null,
      min: 0,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
    },
  },
  {
    timestamps: true,
  }
);

// A user cannot have the same normalized ingredient twice.
pantryItemSchema.index(
  {
    userId: 1,
    normalizedName: 1,
  },
  {
    unique: true,
  }
);

const PantryItem = mongoose.model("PantryItem", pantryItemSchema);

export default PantryItem;