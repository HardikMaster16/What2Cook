import { Link, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="w-full">
        {/* Decorative strip */}
        <div className="flex h-20 w-full sm:h-28 lg:h-[155px]">
          <div className="flex-[71] bg-footer-taupe" />
          <div className="flex-[29] bg-footer-brown" />
        </div>

        {/* Footer content */}
        <div className="bg-cream">
          <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-10 sm:py-14 lg:px-[72px] lg:py-16">
            <div className="grid grid-cols-1 items-center gap-10 text-center sm:grid-cols-3 sm:gap-6 sm:text-left">
              {/* Navigation */}
              <nav aria-label="Footer" className="order-2 sm:order-1 sm:text-center">
                <ul className="m-0 list-none space-y-2 p-0 font-display text-base leading-[23px] text-ink">
                  <li>
                    <Link to="/" className="transition hover:text-walnut">
                      HOME
                    </Link>
                  </li>
                  <li>
                    <Link to="/recipes" className="transition hover:text-walnut">
                      Recipe
                    </Link>
                  </li>
                  <li>
                    <Link to="/pantry" className="transition hover:text-walnut">
                      My Pantry
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="transition hover:text-walnut">
                      Favorite
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Brand and description */}
              <div className="order-1 sm:order-2 sm:text-center">
                <p className="font-display text-[34px] leading-tight text-walnut">
                  Fresse
                </p>

                <p className="mx-auto mt-3 max-w-xs text-[17px] leading-[23px] text-ink sm:max-w-sm">
                  Turn everyday ingredients into something extraordinary.
                  Discover recipes, explore flavors, and fall in love with
                  cooking.
                </p>
              </div>

              {/* Intentionally empty for layout balance */}
              <div className="order-3 hidden sm:block" aria-hidden="true" />
            </div>

            {/* Divider */}
            <div className="mx-auto mt-10 h-[3px] w-[calc(100%-48px)] rounded-full bg-ink sm:w-[calc(100%-96px)] lg:w-[calc(100%-144px)]" />

            {/* Tagline */}
            <p className="mt-4 text-center font-display text-base text-ink">
              Your Cravings, Our Recipes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
