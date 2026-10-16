import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ChefHat } from "lucide-react";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import Pantry from "./pages/Pantry";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import AdminRecipes from "./pages/admin/AdminRecipes";
import AddRecipe from "./pages/admin/AddRecipe";
import EditRecipe from "./pages/admin/EditRecipe";

function NotFound() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-papaya text-walnut">
          <ChefHat size={30} strokeWidth={1.5} />
        </div>

        <h1 className="font-display mt-6 text-6xl font-semibold text-walnut">
          404
        </h1>

        <p className="mt-3 text-lg font-semibold text-ink">
          This page isn't on the menu.
        </p>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/60">
          The page you're looking for may have been moved or doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-walnut px-5 py-3 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
        >
          Back to Fresse
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Routes requiring login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Routes requiring administrator access */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/recipes" element={<AdminRecipes />} />
            <Route path="/admin/recipes/new" element={<AddRecipe />} />
            <Route path="/admin/recipes/:id/edit" element={<EditRecipe />} />
          </Route>

          {/* 404 route */}
          <Route path="/404" element={<NotFound />} />
          <Route
            path="*"
            element={<Navigate to="/404" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
