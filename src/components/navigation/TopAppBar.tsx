"use client";

import Link from "next/link";

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onFilterClick?: () => void;
  subtitle?: string;
}

export function TopAppBar({
  title = "Índice de Higiene",
  showBack = false,
  onFilterClick,
  subtitle,
}: TopAppBarProps) {
  return (
    <header className="bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center w-full px-space-md py-space-sm sticky top-0 left-0 z-40">
      <div className="flex items-center gap-space-sm">
        {showBack ? (
          <Link
            href="/"
            aria-label="Volver al mapa"
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-icon="arrow_back"
            >
              arrow_back
            </span>
          </Link>
        ) : (
          <Link
            href="/explore"
            aria-label="Buscar restaurantes y locales"
            className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined" data-icon="search">
              search
            </span>
          </Link>
        )}

        <div>
          {subtitle && (
            <span className="font-label-caps text-primary uppercase block tracking-wider text-[10px]">
              {subtitle}
            </span>
          )}
          <h1 className="font-headline-sm text-[18px] text-on-surface tracking-tight font-medium">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 border border-outline-variant/40">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span className="font-label-caps text-[9px] text-secondary uppercase tracking-widest">
            En Vivo
          </span>
        </div>

        <button
          onClick={onFilterClick}
          aria-label="Filtros de búsqueda"
          className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
        >
          <span className="material-symbols-outlined" data-icon="tune">
            tune
          </span>
        </button>
      </div>
    </header>
  );
}
