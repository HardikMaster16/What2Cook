import { Link, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const DIETARY_LABELS = {
  none: "No preference",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  egg: "Eggetarian",
  "non-vegetarian": "Non-vegetarian",
};

function formatJoinDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const joined = formatJoinDate(user.createdAt);
  const dietaryLabel =
    DIETARY_LABELS[user.dietaryPreference] || "No preference";

  return (
    <main className="min-h-screen bg-cream">
      <section className="border-b border-walnut/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-coral-dark">
            Your account
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Profile
          </h1>
          <p className="mt-3 max-w-xl text-ink/60">
            Manage how you show up on Fresse and jump back into your kitchen.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Identity card */}
          <div className="h-fit rounded-3xl border border-walnut/10 bg-white p-6 text-center shadow-sm sm:p-8">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "Profile avatar"}
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blush text-walnut">
                <User size={36} />
              </div>
            )}

            <h2 className="mt-5 text-xl font-bold text-ink">
              {user.name || "Fresse member"}
            </h2>

            <p className="mt-1 break-words text-sm text-ink/60">
              {user.email}
            </p>

            {user.role === "admin" && (
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-walnut px-3 py-1.5 text-xs font-semibold text-papaya">
                <ShieldCheck size={14} />
                Administrator
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-walnut/20 px-5 py-3 text-sm font-semibold text-ink/70 transition hover:border-walnut hover:text-walnut"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>

          {/* Details and shortcuts */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-walnut/10 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-ink">
                Account details
              </h3>

              <dl className="mt-5 divide-y divide-walnut/10">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2 text-sm text-ink/60">
                    <Mail size={16} className="text-coral-dark" />
                    Email
                  </dt>
                  <dd className="truncate text-sm font-medium text-ink">
                    {user.email}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2 text-sm text-ink/60">
                    <Sparkles size={16} className="text-coral-dark" />
                    Dietary preference
                  </dt>
                  <dd className="text-sm font-medium text-ink">
                    {dietaryLabel}
                  </dd>
                </div>

                {joined && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm text-ink/60">Member since</dt>
                    <dd className="text-sm font-medium text-ink">
                      {joined}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-3xl border border-walnut/10 bg-papaya/50 p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-bold text-ink">
                Quick links
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/pantry"
                  className="flex items-center gap-3 rounded-2xl border border-walnut/10 bg-white p-4 transition hover:border-walnut/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-walnut">
                    <PackageOpen size={19} />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    My Pantry
                  </span>
                </Link>

                <Link
                  to="/favorites"
                  className="flex items-center gap-3 rounded-2xl border border-walnut/10 bg-white p-4 transition hover:border-walnut/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-walnut">
                    <Heart size={19} />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Favorites
                  </span>
                </Link>

                <Link
                  to="/recipes"
                  className="flex items-center gap-3 rounded-2xl border border-walnut/10 bg-white p-4 transition hover:border-walnut/30"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-walnut">
                    <ChefHat size={19} />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Discover Recipes
                  </span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin/recipes"
                    className="flex items-center gap-3 rounded-2xl border border-walnut/10 bg-white p-4 transition hover:border-walnut/30"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blush text-walnut">
                      <LayoutDashboard size={19} />
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      Admin Dashboard
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
