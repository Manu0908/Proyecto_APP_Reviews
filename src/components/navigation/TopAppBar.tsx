"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onFilterClick?: () => void;
  onInstallClick?: () => void;
  subtitle?: string;
  isSearchMode?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export function TopAppBar({
  title = "Índice de Higiene",
  showBack = false,
  onFilterClick,
  onInstallClick,
  subtitle,
  isSearchMode = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Buscar restaurantes, cafés, zonas...",
}: TopAppBarProps) {
  const router = useRouter();

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center w-full px-space-md py-2.5 sticky top-0 left-0 z-40 transition-all">
      {isSearchMode ? (
        // Barra de búsqueda moderna de ancho completo (Estilo Google Maps / inDrive)
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2.5 bg-surface-container-high/90 border border-outline-variant/50 rounded-full px-3.5 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <span
              className="material-symbols-outlined text-[20px] text-primary shrink-0"
              data-icon="search"
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent border-none outline-none text-on-surface text-[13.5px] w-full placeholder:text-outline focus:ring-0 p-0 font-body-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                aria-label="Limpiar búsqueda"
                className="text-outline hover:text-on-surface p-0.5 rounded-full flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              aria-label="Descargar o instalar app"
              title="Descargar o instalar aplicación móvil"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/15 border border-teal-500/40 text-teal-300 hover:bg-teal-500/25 transition-all active:scale-95 shadow-sm shrink-0 relative"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="install_mobile">
                install_mobile
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-400 absolute top-1 right-1 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 absolute top-1.5 right-1.5" />
            </button>
          )}

          {onFilterClick && (
            <button
              type="button"
              onClick={onFilterClick}
              aria-label="Filtros de búsqueda"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high/90 border border-outline-variant/50 text-primary hover:bg-surface-container-highest transition-colors active:scale-95 shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="tune">
                tune
              </span>
            </button>
          )}
        </div>
      ) : (
        // Encabezado estándar para vistas secundarias
        <>
          <div className="flex items-center gap-space-sm">
            {showBack && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Volver a la vista anterior"
                className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  data-icon="arrow_back"
                >
                  arrow_back
                </span>
              </button>
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
            {onFilterClick && (
              <button
                type="button"
                onClick={onFilterClick}
                aria-label="Filtros de búsqueda"
                className="w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="tune">
                  tune
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </header>
  );
}
