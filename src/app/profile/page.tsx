"use client";

import { useState } from "react";
import Image from "next/image";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { MOCK_PROFILE } from "@/data/mockData";

export default function ProfilePage() {
  const [profile] = useState(MOCK_PROFILE);
  const [activeSubTab, setActiveSubTab] = useState<"inspector" | "negocio">("inspector");
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <TopAppBar
        title="Mi Perfil"
        subtitle="Comunidad Gastronómica"
      />

      <main className="flex-1 flex flex-col px-space-md pt-3 pb-24 gap-4">
        {/* Sub-Tabs: Modo Perfil vs Modo Propietario */}
        <div className="flex bg-surface-container-lowest p-1 rounded-full border border-outline-variant/30">
          <button
            onClick={() => setActiveSubTab("inspector")}
            className={`flex-1 py-1.5 rounded-full text-label-md text-[12px] font-medium transition-all ${
              activeSubTab === "inspector"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Mi Cuenta
          </button>
          <button
            onClick={() => setActiveSubTab("negocio")}
            className={`flex-1 py-1.5 rounded-full text-label-md text-[12px] font-medium transition-all ${
              activeSubTab === "negocio"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-outline hover:text-on-surface"
            }`}
          >
            Portal de Negocios
          </button>
        </div>

        {activeSubTab === "inspector" ? (
          <>
            {/* Inspector Identity Card */}
            <section className="glass-panel rounded-2xl p-4 border border-outline-variant/40 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_12px_rgba(173,204,211,0.3)]">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.username}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-headline-sm text-[18px] text-on-surface leading-tight">
                      {profile.username}
                    </h2>
                    <span
                      className="material-symbols-outlined text-primary text-[17px]"
                      data-icon="verified"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <p className="font-body-sm text-[12px] text-outline">
                    {profile.handle}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-secondary-container/60 border border-primary/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-label-caps text-[9.5px] text-primary tracking-wider uppercase">
                      {profile.rankTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="pt-2 border-t border-outline-variant/20">
                <div className="flex justify-between items-center text-[11px] font-label-caps text-outline mb-1.5">
                  <span>RANGO ACTUAL: NIVEL {profile.rankLevel}</span>
                  <span className="text-primary font-metric-sm text-[11px]">
                    {profile.currentXP} / {profile.nextLevelXP} XP
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(173,204,211,0.5)]"
                    style={{
                      width: `${(profile.currentXP / profile.nextLevelXP) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-body-sm text-[10.5px] text-outline mt-1 block text-right">
                  Faltan 160 XP para Comisionado Sanitario (R4)
                </span>
              </div>
            </section>

            {/* Reputation Metrics Grid */}
            <section className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container-low/80 p-3 rounded-xl border border-outline-variant/30 text-center">
                <span className="font-label-caps text-[9px] text-outline block">
                  AUDITORÍAS
                </span>
                <span className="font-metric-display text-[20px] text-on-surface font-semibold">
                  {profile.totalAudits}
                </span>
              </div>
              <div className="bg-surface-container-low/80 p-3 rounded-xl border border-outline-variant/30 text-center">
                <span className="font-label-caps text-[9px] text-outline block">
                  TICKETS VERIF.
                </span>
                <span className="font-metric-display text-[20px] text-primary font-semibold">
                  {profile.verifiedReceipts}
                </span>
              </div>
              <div className="bg-surface-container-low/80 p-3 rounded-xl border border-outline-variant/30 text-center">
                <span className="font-label-caps text-[9px] text-outline block">
                  CONSENSO
                </span>
                <span className="font-metric-display text-[20px] text-on-surface font-semibold">
                  {profile.consensusScore}%
                </span>
              </div>
            </section>

            {/* Badges Earned */}
            <section className="glass-card rounded-xl p-3.5 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-caps text-[10px] text-outline tracking-wider uppercase">
                  Distintivos y Méritos
                </span>
                <span className="font-label-caps text-primary text-[10px]">
                  3 DESBLOQUEADOS
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {profile.badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 flex flex-col items-center text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary mb-1 border border-primary/30">
                      <span
                        className="material-symbols-outlined text-[17px]"
                        data-icon={b.icon}
                      >
                        {b.icon}
                      </span>
                    </div>
                    <span className="font-label-md text-[11px] text-on-surface font-medium leading-tight">
                      {b.name}
                    </span>
                    <span className="font-label-caps text-[8px] text-outline mt-0.5">
                      {b.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Auth Banner Fantasma */}
            <section className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col items-center text-center gap-2">
              <span
                className="material-symbols-outlined text-primary text-[24px]"
                data-icon="vpn_key"
              >
                vpn_key
              </span>
              <div>
                <h3 className="font-headline-sm text-[15px] text-on-surface font-medium">
                  Sesión Comunitaria Activa
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">
                  Estás navegando en modo anónimo con respaldo local. Sincroniza tu cuenta para respaldar tus insignias en la nube.
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-1 px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-[12px] font-semibold active:scale-95 transition-all shadow-sm"
              >
                Vincular Cuenta (Google / Magic Link)
              </button>
            </section>
          </>
        ) : (
          /* Sub-Tab Modo Propietario de Negocio */
          <section className="flex flex-col gap-3">
            <div className="glass-panel rounded-2xl p-4 border border-outline-variant/40 flex flex-col gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-primary border border-primary/30">
                <span
                  className="material-symbols-outlined text-[24px]"
                  data-icon="storefront"
                >
                  storefront
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-[18px] text-on-surface font-medium">
                  Panel de Propietario de Restaurante
                </h3>
                <p className="font-body-sm text-[12.5px] text-on-surface-variant leading-relaxed mt-1">
                  Reclama tu restaurante para responder auditorías comunitarias, activar el aviso privado de incidencias de 24 horas y exhibir el sello oficial con código QR.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() =>
                    alert("Flujo fantasma: Búsqueda del restaurante a reclamar con número de RUC/NIT.")
                  }
                  className="w-full py-2.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[12.5px] font-semibold active:scale-95 transition-all"
                >
                  + Reclamar Mi Restaurante
                </button>
                <button
                  onClick={() =>
                    alert("Flujo fantasma: Registro de nuevo restaurante independiente.")
                  }
                  className="w-full py-2.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-label-md text-[12.5px] active:scale-95 transition-all"
                >
                  Dar de Alta un Nuevo Local
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0"
                data-icon="verified_user"
              >
                verified_user
              </span>
              <p className="font-body-sm text-[11.5px] text-on-surface-variant leading-relaxed">
                Todas las reclamaciones de locales pasan por un filtro de verificación documental (registro mercantil o factura de servicios) para evitar suplantaciones de identidad.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Auth Modal Fantasma */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-3.5">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-[17px] text-on-surface">
                Iniciar Sesión Fantasma
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="close">
                  close
                </span>
              </button>
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              En esta fase de planeación y cascarón no se requieren contraseñas reales.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  alert("Sesión simulada con Google Auth.");
                  setShowAuthModal(false);
                }}
                className="w-full py-2.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface text-[12.5px] font-medium flex items-center justify-center gap-2"
              >
                <span>Continuar con Google</span>
              </button>
              <button
                onClick={() => {
                  alert("Enlace mágico enviado al correo simulado.");
                  setShowAuthModal(false);
                }}
                className="w-full py-2.5 rounded-full bg-primary-container text-on-primary-container text-[12.5px] font-semibold flex items-center justify-center gap-2"
              >
                <span>Enviar Magic Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </>
  );
}
