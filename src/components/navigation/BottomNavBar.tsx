"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavBarProps {
  onOpenAudit?: () => void;
}

export function BottomNavBar({}: BottomNavBarProps = {}) {
  const pathname = usePathname();

  const isMap = pathname === "/";
  const isExplore = pathname === "/explore";
  const isNew = pathname === "/new";
  const isProfile = pathname === "/profile";

  return (
    <nav
      aria-label="Navegación principal"
      className="bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-2xl fixed bottom-0 left-0 w-full h-[var(--bottom-nav-h)] z-40 flex justify-around items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] max-w-md mx-auto right-0"
    >
      {/* Tab 1: Mapa */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] active:scale-95 transition-transform duration-150 group ${
          isMap ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[23px]"
          data-icon="map"
          style={{ fontVariationSettings: isMap ? "'FILL' 1" : "'FILL' 0" }}
        >
          map
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Mapa
        </span>
      </Link>

      {/* Tab 2: Directorio */}
      <Link
        href="/explore"
        className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] active:scale-95 transition-transform duration-150 group ${
          isExplore ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[23px]"
          data-icon="storefront"
          style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}
        >
          storefront
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Directorio
        </span>
      </Link>

      {/* Tab 3: Dar de Alta Nuevo (+ Central destacado) */}
      <Link
        href="/new"
        className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] active:scale-95 transition-transform duration-150 group ${
          isNew ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-secondary-container/90 border border-primary/50 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[21px]" data-icon="add_location_alt">
            add_location_alt
          </span>
        </div>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Alta Local
        </span>
      </Link>

      {/* Tab 4: Perfil / Cuenta */}
      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center min-h-[48px] min-w-[64px] active:scale-95 transition-transform duration-150 group ${
          isProfile ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[23px]"
          data-icon="person"
          style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Perfil
        </span>
      </Link>
    </nav>
  );
}
