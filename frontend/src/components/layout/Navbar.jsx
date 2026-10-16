import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-walnut" : "text-ink/60 hover:text-walnut"
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `block rounded-xl px-4 py-3 text-base font-medium transition ${
    isActive
      ? "bg-papaya text-walnut"
      : "text-ink/70 hover:bg-papaya/60 hover:text-walnut"
  }`;

function Logo({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2.5"
      aria-label="Fresse home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-walnut text-papaya shadow-sm">
        <span className="font-display text-lg font-semibold leading-none">
          F
        </span>
      </span>

      <span className="font-display text-2xl font-semibold tracking-tight text-walnut">
        Fresse
      </span>
    </Link>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-walnut/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo onClick={closeMenu} />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/recipes" className={navLinkClass}>
            Recipes
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/pantry" className={navLinkClass}>
                My Pantry
              </NavLink>

              <NavLink to="/favorites" className={navLinkClass}>
                Favorites
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin/recipes" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right-side actions (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {!loading && isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-walnut/15 py-1.5 pl-1.5 pr-3 transition hover:border-walnut/30"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blush text-walnut">
                    <User size={14} />
                  </span>
                )}

                <span className="max-w-28 truncate text-sm font-medium text-ink">
                  {user.name || "Account"}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="flex items-center gap-2 rounded-xl border border-walnut/20 px-3 py-2 text-sm font-medium text-ink/70 transition hover:border-walnut hover:text-walnut"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            !loading && (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-ink/70 transition hover:text-walnut"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-walnut px-4 py-2.5 text-sm font-semibold text-papaya transition hover:bg-walnut-dark"
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-walnut/15 text-walnut md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-walnut/10 bg-cream px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              Home
            </NavLink>

            <NavLink to="/recipes" onClick={closeMenu} className={mobileNavLinkClass}>
              Recipes
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/pantry" onClick={closeMenu} className={mobileNavLinkClass}>
                  <span className="flex items-center gap-2">
                    <PackageOpen size={17} />
                    My Pantry
                  </span>
                </NavLink>

                <NavLink to="/favorites" onClick={closeMenu} className={mobileNavLinkClass}>
                  Favorites
                </NavLink>

                <NavLink to="/profile" onClick={closeMenu} className={mobileNavLinkClass}>
                  Profile
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink to="/admin/recipes" onClick={closeMenu} className={mobileNavLinkClass}>
                <span className="flex items-center gap-2">
                  <LayoutDashboard size={17} />
                  Admin Dashboard
                </span>
              </NavLink>
            )}
          </nav>

          <div className="mt-4 border-t border-walnut/10 pt-4">
            {!loading && isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-walnut/20 px-4 py-3 text-sm font-semibold text-ink/70 hover:border-walnut hover:text-walnut"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              !loading && (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-walnut/20 px-4 py-3 text-center text-sm font-semibold text-ink hover:border-walnut"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-walnut px-4 py-3 text-center text-sm font-semibold text-papaya hover:bg-walnut-dark"
                  >
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
