"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavBarProps {
  onOpenAudit?: () => void;
}

export function BottomNavBar({ onOpenAudit }: BottomNavBarProps) {
  const pathname = usePathname();

  const isExplore = pathname === "/";
  const isInspect = pathname === "/explore";
  const isVerified = pathname.startsWith("/restaurant");
  const isProfile = pathname === "/profile";

  return (
    <nav
      aria-label="Navegación principal"
      className="bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-2xl fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-space-xs py-space-sm max-w-md mx-auto right-0"
    >
      {/* Tab 1: Explore (Mapa) */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isExplore
            ? "text-primary"
            : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined"
          data-icon="explore"
          style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}
        >
          explore
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Explore
        </span>
      </Link>

      {/* Tab 2: Inspect (Directorio / Lista) */}
      <Link
        href="/explore"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isInspect
            ? "text-primary"
            : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined"
          data-icon="verified_user"
          style={{ fontVariationSettings: isInspect ? "'FILL' 1" : "'FILL' 0" }}
        >
          verified_user
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Inspect
        </span>
      </Link>

      {/* Tab 3: Verified (Dossier / Ficha) */}
      <Link
        href="/restaurant/lecume-marine"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isVerified
            ? "text-primary"
            : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined"
          data-icon="hotel_class"
          style={{ fontVariationSettings: isVerified ? "'FILL' 1" : "'FILL' 0" }}
        >
          hotel_class
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Verified
        </span>
      </Link>

      {/* Tab 4: Audit (Modal interactivo táctil) */}
      <button
        type="button"
        onClick={onOpenAudit}
        className="flex flex-col items-center justify-center text-outline hover:text-primary active:scale-90 transition-transform duration-150 group"
      >
        <div className="relative">
          <span className="material-symbols-outlined" data-icon="assignment">
            assignment
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        </div>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Audits
        </span>
      </button>

      {/* Tab 5: Profile (Inspector / Login fantasma) */}
      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-150 group ${
          isProfile
            ? "text-primary"
            : "text-outline hover:text-primary-fixed-dim"
        }`}
      >
        <span
          className="material-symbols-outlined"
          data-icon="person"
          style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="font-label-caps text-[10px] mt-0.5 tracking-wider">
          Profile
        </span>
      </Link>
    </nav>
  );
}
