import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from saving the same recipe more than once.
favoriteSchema.index(
  {
    userId: 1,
    recipeId: 1,
  },
  {
    unique: true,
  }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;