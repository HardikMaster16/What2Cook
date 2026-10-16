import dotenv from "dotenv";
import connectDB from "../src/config/db.js";

import User from "../src/models/User.js";
import Recipe from "../src/models/Recipe.js";
import PantryItem from "../src/models/PantryItem.js";
import Favorite from "../src/models/Favorite.js";

dotenv.config();

const cleanupTestData = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: "dbtest@what2cook.local",
    });

    if (user) {
      await PantryItem.deleteMany({
        userId: user._id,
      });

      await Favorite.deleteMany({
        userId: user._id,
      });

      await User.deleteOne({
        _id: user._id,
      });
    }

    const recipeResult = await Recipe.deleteOne({
      externalId: "TEST-001",
    });

    console.log("\nTest data cleanup complete.");
    console.log(`Test recipe removed: ${recipeResult.deletedCount}`);

    const counts = {
      users: await User.countDocuments(),
      recipes: await Recipe.countDocuments(),
      pantryItems: await PantryItem.countDocuments(),
      favorites: await Favorite.countDocuments(),
    };

    console.log("\nCurrent database counts:");
    console.table(counts);

    process.exit(0);
  } catch (error) {
    console.error("\nCleanup failed:");
    console.error(error.message);

    process.exit(1);
  }
};

cleanupTestData();