"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { MOCK_RESTAURANTS } from "@/data/mockData";

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = (params?.id as string) || "lecume-marine";

  const restaurant =
    MOCK_RESTAURANTS.find((r) => r.id === restaurantId) || MOCK_RESTAURANTS[0];

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("difamacion");

  // Nivel textual y colores según la escala de 5 niveles
  const levelLabels = {
    organico: "NIVEL 1 • ORGÁNICO",
    filtrado: "NIVEL 2 • FILTRADO",
    antiseptico: "NIVEL 3 • ANTISÉPTICO",
    esterilizado: "NIVEL 4 • ESTERILIZADO",
    aseptico: "NIVEL 5 • ASÉPTICO PLATINUM",
  };

  return (
    <>
      <TopAppBar
        title="Dossier Sanitario"
        showBack={true}
        subtitle="Auditoría de Bioseguridad"
      />

      <main className="flex-1 flex flex-col pb-28 overflow-x-hidden">
        {/* Hero Fotográfico con viñeta oceánica profunda */}
        <section className="relative w-full h-64 overflow-hidden bg-surface-container-lowest">
          <div className="absolute inset-0 z-0">
            <Image
              src={restaurant.heroImage}
              alt={restaurant.name}
              fill
              className="object-cover object-center radial-mask-ocean brightness-75 contrast-125"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          </div>

          {/* Pastilla Flotante de Monitoreo */}
          <div className="absolute top-4 left-4 z-10">
            <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2 border border-outline-variant/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-label-caps text-on-surface tracking-widest text-[9.5px]">
                BIO-STREAM EN VIVO
              </span>
            </div>
          </div>

          {/* Coordenadas & Certificado */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-primary">
                <span
                  className="material-symbols-outlined text-[15px]"
                  data-icon="location_on"
                >
                  location_on
                </span>
                <span className="font-label-caps tracking-widest text-[11px] text-tertiary">
                  {restaurant.coordinatesText}
                </span>
              </div>
              <span className="font-label-caps text-primary uppercase text-[10px] tracking-widest bg-surface-container-low/80 px-2 py-0.5 rounded border border-outline-variant/30">
                {restaurant.location}
              </span>
            </div>

            <div className="flex items-center gap-1 text-primary bg-surface-container/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-primary-container/30">
              <span
                className="material-symbols-outlined text-[14px]"
                data-icon="verified"
              >
                verified
              </span>
              <span className="font-label-caps text-[9.5px] text-on-surface">
                NORMA ISO-22000
              </span>
            </div>
          </div>
        </section>

        {/* Contenido del Dossier */}
        <div className="px-space-md pt-3 flex flex-col gap-5">
          {/* Encabezado Culinario */}
          <section className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-primary tracking-widest text-[11px] uppercase">
                {restaurant.tagline}
              </span>
              <span className="font-label-caps text-on-surface-variant text-[10px]">
                {restaurant.auditCycle}
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-[28px] text-on-surface tracking-tight font-normal">
              {restaurant.name}
            </h1>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              {restaurant.description}
            </p>
          </section>

          {/* Widget de Grado Concéntrico Circular */}
          <section className="glass-panel glow-aura rounded-xl p-5 border border-outline-variant/40 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative w-36 h-36 flex items-center justify-center my-1">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="52"
                    stroke="#152128"
                    strokeWidth="5"
                  />
                  <circle
                    className="filter drop-shadow-[0_0_6px_rgba(173,204,211,0.6)] transition-all duration-1000"
                    cx="60"
                    cy="60"
                    fill="none"
                    r="52"
                    stroke="#adccd3"
                    strokeDasharray="326.7"
                    strokeDashoffset={326.7 * (1 - restaurant.grade / 100)}
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="44"
                    stroke="#414849"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-metric-display text-[40px] leading-none tracking-tighter text-on-surface font-semibold">
                    {restaurant.grade}
                  </span>
                  <span className="font-label-caps text-primary tracking-widest text-[9px] mt-0.5">
                    PUNTOS / 100
                  </span>
                </div>
              </div>

              {/* Sello de Grado */}
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-secondary-container/40 border border-primary/30 glow-ring">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  data-icon="shield"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
                <span className="font-label-caps text-on-surface tracking-wider text-[11px]">
                  {levelLabels[restaurant.level]}
                </span>
              </div>

              <div className="w-full my-4 border-t border-outline-variant/30" />

              {/* Metadatos */}
              <div className="w-full grid grid-cols-2 gap-3 text-left">
                <div className="bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/20">
                  <span className="font-label-caps text-tertiary block text-[9.5px] mb-0.5">
                    ÚLTIMA AUDITORÍA
                  </span>
                  <span className="font-label-md text-on-surface font-medium text-[12.5px]">
                    {restaurant.auditDate}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant block mt-0.5">
                    {restaurant.auditCycle}
                  </span>
                </div>

                <div className="bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/20">
                  <span className="font-label-caps text-tertiary block text-[9.5px] mb-0.5">
                    ACREDITACIÓN
                  </span>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="font-label-md text-on-surface font-medium text-[12.5px] truncate">
                      {restaurant.accreditation}
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-primary block mt-0.5 flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[12px]"
                      data-icon="verified_user"
                    >
                      verified_user
                    </span>
                    Certificado Activo
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Distintivo de Vitrina QR (Botón Destacado) */}
          <section className="glass-card rounded-xl p-3.5 border border-primary/40 bg-secondary-container/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-primary/40 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[22px]"
                  data-icon="qr_code_2"
                >
                  qr_code_2
                </span>
              </div>
              <div>
                <span className="font-label-caps text-primary text-[10px] tracking-wider uppercase block">
                  Distintivo de Escaparate
                </span>
                <p className="font-label-md text-on-surface text-[12px]">
                  Calcomanía física con QR para vitrinas
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[11.5px] font-semibold active:scale-95 transition-all shadow-sm"
            >
              Ver QR
            </button>
          </section>

          {/* Insignia de Visita Verificada */}
          <section className="glass-card rounded-xl p-3.5 border border-outline-variant/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[20px]"
                  data-icon="receipt_long"
                >
                  receipt_long
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-label-caps text-primary text-[10px] tracking-wider uppercase">
                    Protocolo de Ticket Verificado
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <p className="font-label-md text-on-surface text-[12px]">
                  Hash:{" "}
                  <span className="font-metric-sm text-[12px] text-tertiary">
                    {restaurant.verifiedProtocolHash}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsValidated(!isValidated)}
              className="px-2.5 py-1.5 rounded-md bg-secondary-container/50 border border-outline-variant/40 text-on-surface hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="font-label-caps text-[10px]">
                {isValidated ? "VÁLIDO ✓" : "COMPROBAR"}
              </span>
            </button>
          </section>

          {/* Desglose de Criterios */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="font-label-caps text-primary tracking-widest text-[10px] uppercase">
                ESTÁNDARES DE BIOSEGURIDAD
              </span>
              <h3 className="font-headline-sm text-[19px] text-on-surface">
                Desglose de Criterios Sanitarios
              </h3>
            </div>
            <span className="font-label-caps text-on-surface-variant text-[11px]">
              {restaurant.detailedMetrics.length} de {restaurant.detailedMetrics.length} Evaluados
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {restaurant.detailedMetrics.map((m) => (
              <div
                key={m.id}
                className="glass-panel p-4 rounded-xl border border-outline-variant/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        data-icon={m.icon}
                      >
                        {m.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-on-surface font-medium text-[13px]">
                        {m.name}
                      </h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        {m.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="font-label-caps text-primary bg-primary-container/20 px-2 py-0.5 rounded text-[9.5px] border border-primary/30">
                    {m.tag}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1.5">
                  <span className="font-metric-display text-[22px] font-semibold text-on-surface leading-none">
                    {m.value}
                  </span>
                  {m.threshold && (
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      {m.threshold}
                    </span>
                  )}
                </div>

                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cronología de Sensores */}
          {restaurant.chronology.length > 0 && (
            <section className="glass-panel rounded-xl p-4 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    data-icon="schedule"
                  >
                    schedule
                  </span>
                  <h4 className="font-headline-sm text-[17px] text-on-surface">
                    Registro de Monitoreo en Vivo
                  </h4>
                </div>
                <span className="font-label-caps text-primary text-[10px]">
                  SINCRONIZADO
                </span>
              </div>

              <div className="relative pl-5 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/40">
                {restaurant.chronology.map((ev) => (
                  <div key={ev.id} className="relative">
                    <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface" />
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface font-medium text-[12.5px]">
                        {ev.title}
                      </span>
                      <span className="font-metric-sm text-[11px] text-primary">
                        {ev.timestamp}
                      </span>
                    </div>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">
                      {ev.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Protección contra Difamación & Reclamación */}
          <section className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center flex flex-col gap-2">
            <h4 className="font-headline-sm text-[16px] text-on-surface font-medium">
              Garantía de Transparencia Sanitaria
            </h4>
            <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              ¿Detectas información errónea o presunta difamación sobre este restaurante? Los propietarios y la comunidad pueden apelar formalmente.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3.5 py-1.5 rounded-full border border-outline-variant/50 text-outline hover:text-red-300 hover:border-red-400 font-label-md text-[11.5px] transition-colors"
              >
                Reportar Reseña Injusta
              </button>
              <button
                onClick={() =>
                  alert("Flujo de reclamación: Permite al dueño autenticado subir su cédula jurídica.")
                }
                className="px-3.5 py-1.5 rounded-full bg-secondary-container/60 border border-primary/40 text-primary font-label-md text-[11.5px] transition-all hover:bg-primary-container hover:text-on-primary-container"
              >
                Reclamar Restaurante
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Dock Inferior Flotante de Acciones */}
      <div className="fixed bottom-14 left-0 right-0 z-30 flex justify-center p-3 pointer-events-none max-w-md mx-auto">
        <div className="w-full pointer-events-auto bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/40 rounded-full p-1.5 shadow-2xl flex items-center gap-2">
          <button
            onClick={() =>
              alert("Generando informe clínico oficial en PDF con hash de bioseguridad...")
            }
            className="flex-1 py-2.5 px-3 rounded-full border border-outline-variant/40 bg-surface-container/60 hover:border-primary text-on-surface hover:text-primary transition-colors flex items-center justify-center gap-1.5 active:scale-95 text-[12px] font-medium"
          >
            <span
              className="material-symbols-outlined text-[16px]"
              data-icon="picture_as_pdf"
            >
              picture_as_pdf
            </span>
            <span className="font-label-caps text-[10px] tracking-wide">
              Informe PDF
            </span>
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex-[1.4] py-2.5 px-4 rounded-full bg-primary-container text-on-primary-container font-bold shadow-lg hover:shadow-[0_0_16px_rgba(166,192,198,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 text-[12.5px]"
          >
            <span
              className="material-symbols-outlined text-[17px]"
              data-icon="assignment_turned_in"
            >
              assignment_turned_in
            </span>
            <span className="font-label-caps text-[11px] tracking-wider text-on-primary-container">
              Nueva Auditoría
            </span>
          </button>
        </div>
      </div>

      <BottomNavBar onOpenAudit={() => setIsAuditModalOpen(true)} />

      {/* Modal de Calcomanía Oficial con QR */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-container-low border border-primary/40 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]" data-icon="qr_code_2">
                qr_code_2
              </span>
            </div>
            <h3 className="font-headline-sm text-[18px] text-on-surface">
              Distintivo de Escaparate Oficial
            </h3>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Calcomanía oficial para pegar en la entrada de <strong className="text-on-surface">{restaurant.name}</strong>.
            </p>

            {/* QR Mockup Visual */}
            <div className="p-4 rounded-xl bg-white flex flex-col items-center justify-center my-1 shadow-lg">
              <div className="w-36 h-36 bg-neutral-900 rounded-lg flex items-center justify-center text-white text-[12px] font-mono p-2 text-center">
                [ QR DINÁMICO: {restaurant.verifiedProtocolHash} ]
              </div>
              <span className="text-neutral-800 text-[10px] font-bold mt-1 tracking-wider uppercase">
                {levelLabels[restaurant.level]}
              </span>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => {
                  alert("Descargando PDF vectorial listo para imprimir calcomanía de 15x15cm...");
                  setShowQRModal(false);
                }}
                className="flex-1 py-2.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-[12px] font-semibold"
              >
                Descargar Calcomanía PDF
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2.5 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface text-[12px] font-label-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reporte contra Difamación */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-surface-container-low border border-red-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-300">
                <span className="material-symbols-outlined text-[20px]" data-icon="report">
                  report
                </span>
                <h3 className="font-headline-sm text-[16px] text-on-surface font-medium">
                  Reportar por Difamación
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="close">
                  close
                </span>
              </button>
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Protegemos a los negocios contra reseñas maliciosas sin sustento.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <label className="text-[11px] font-label-caps text-outline uppercase">
                Motivo de la Impugnación
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3 py-2 text-[12.5px] text-on-surface focus:outline-none"
              >
                <option value="difamacion">Difamación o acusación falsa de plagas</option>
                <option value="competencia">Sospecha de guerra sucia comercial</option>
                <option value="ofensivo">Lenguaje discriminatorio u ofensivo</option>
                <option value="sin_visita">Usuario nunca consumió en el local</option>
              </select>

              <textarea
                rows={3}
                placeholder="Explica los hechos o adjunta prueba de subsanación..."
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 text-[12px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
              />

              <button
                onClick={() => {
                  alert("Reporte enviado a moderación. El restaurante recibirá respuesta en menos de 24 horas.");
                  setShowReportModal(false);
                }}
                className="w-full py-2.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 font-label-md text-[12.5px] font-semibold mt-1"
              >
                Enviar a Veeduría Sanitaria
              </button>
            </div>
          </div>
        </div>
      )}

      <QuickAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        restaurantName={restaurant.name}
        restaurantLocation={restaurant.location}
      />
    </>
  );
}
