"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavBarProps {
  onOpenAudit?: () => void;
}

export function BottomNavBar({ onOpenAudit }: BottomNavBarProps) {
  const pathname = usePathname();

  const isMap = pathname === "/";
  const isExplore = pathname === "/explore";
  const isNew = pathname === "/new";
  const isVerified = pathname.startsWith("/restaurant");
  const isProfile = pathname === "/profile";

  return (
    <nav
      aria-label="Navegación principal"
      className="bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-2xl fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-1 py-2 max-w-md mx-auto right-0"
    >
      {/* Tab 1: Mapa */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isMap ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[21px]"
          data-icon="map"
          style={{ fontVariationSettings: isMap ? "'FILL' 1" : "'FILL' 0" }}
        >
          map
        </span>
        <span className="font-label-caps text-[9.5px] mt-0.5 tracking-wider">
          Mapa
        </span>
      </Link>

      {/* Tab 2: Directorio */}
      <Link
        href="/explore"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isExplore ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[21px]"
          data-icon="storefront"
          style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}
        >
          storefront
        </span>
        <span className="font-label-caps text-[9.5px] mt-0.5 tracking-wider">
          Directorio
        </span>
      </Link>

      {/* Tab 3: Dar de Alta Nuevo (+ Central destacado) */}
      <Link
        href="/new"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isNew ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-secondary-container/80 border border-primary/40 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[19px]" data-icon="add_location_alt">
            add_location_alt
          </span>
        </div>
        <span className="font-label-caps text-[9.5px] mt-0.5 tracking-wider">
          Alta Local
        </span>
      </Link>

      {/* Tab 4: Ficha / Auditoría */}
      <Link
        href="/restaurant/lecume-marine"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isVerified ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[21px]"
          data-icon="verified_user"
          style={{ fontVariationSettings: isVerified ? "'FILL' 1" : "'FILL' 0" }}
        >
          verified_user
        </span>
        <span className="font-label-caps text-[9.5px] mt-0.5 tracking-wider">
          Dossier
        </span>
      </Link>

      {/* Tab 5: Perfil */}
      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isProfile ? "text-primary" : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined text-[21px]"
          data-icon="person"
          style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="font-label-caps text-[9.5px] mt-0.5 tracking-wider">
          Inspector
        </span>
      </Link>
    </nav>
  );
}
