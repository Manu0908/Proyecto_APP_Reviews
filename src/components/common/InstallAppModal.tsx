"use client";

import { useState } from "react";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  canInstallNatively?: boolean;
}

export function InstallAppModal({
  isOpen,
  onClose,
  onNativeInstall,
  canInstallNatively = false,
}: InstallAppModalProps) {
  const [activePlatform, setActivePlatform] = useState<"android" | "ios">("android");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-w-md mx-auto">
      {/* Fondo difuminado */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-10 transition-opacity"
      />

      {/* Tarjeta del Modal */}
      <div className="relative z-20 w-full ocean-glass-card rounded-3xl border border-outline-variant/40 p-5 shadow-2xl flex flex-col gap-4 animate-fade-in text-on-surface">
        {/* Cabecera */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary-container/80 border border-primary/40 flex items-center justify-center text-primary shadow-md">
              <span className="material-symbols-outlined text-[24px]">install_mobile</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface leading-tight">
                Instalar Aplicación Móvil
              </h3>
              <p className="text-[12px] text-outline mt-0.5">
                Acceso directo a pantalla completa sin barras de navegador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[19px]">close</span>
          </button>
        </div>

        {/* Si el navegador soporta instalación directa nativa */}
        {canInstallNatively && onNativeInstall ? (
          <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-container-high/60 border border-primary/30">
            <p className="text-[12.5px] text-on-surface-variant leading-relaxed">
              Tu navegador permite instalar la aplicación directamente con un solo toque:
            </p>
            <button
              type="button"
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-semibold text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Instalar ahora en tu dispositivo</span>
            </button>
          </div>
        ) : null}

        {/* Selector de plataforma para guía paso a paso */}
        <div className="flex bg-surface-container-lowest p-1 rounded-full border border-outline-variant/30 text-[12px]">
          <button
            type="button"
            onClick={() => setActivePlatform("android")}
            className={`flex-1 py-1.5 rounded-full font-medium transition-all flex items-center justify-center gap-1.5 ${
              activePlatform === "android"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">android</span>
            <span>Android / Chrome</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform("ios")}
            className={`flex-1 py-1.5 rounded-full font-medium transition-all flex items-center justify-center gap-1.5 ${
              activePlatform === "ios"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">phone_iphone</span>
            <span>iPhone / Safari</span>
          </button>
        </div>

        {/* Instrucciones según plataforma */}
        {activePlatform === "ios" ? (
          <div className="space-y-2.5 text-[12.5px] text-on-surface-variant p-3.5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                Toca el botón <strong>Compartir</strong> en la barra inferior de Safari (icono de cuadrado con flecha hacia arriba).
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                Desplaza hacia abajo y selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p>
                Toca <strong>&quot;Añadir&quot;</strong> en la esquina superior derecha y ¡listo!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 text-[12.5px] text-on-surface-variant p-3.5 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                Toca el botón de <strong>menú (tres puntos ⋮)</strong> en la esquina superior del navegador.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Añadir a la pantalla principal&quot;</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p>
                Confirma la instalación para disfrutar de la experiencia completa sin conexión.
              </p>
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-full bg-surface-container-high border border-outline-variant/50 text-on-surface font-medium text-[13px] hover:bg-surface-container-highest transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
