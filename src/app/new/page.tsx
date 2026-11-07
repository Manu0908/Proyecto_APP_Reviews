"use client";

import { useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";

export default function NewRestaurantPage() {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("Cocina Marina / Pescados");
  const [address, setAddress] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      alert("Por favor ingresa el nombre y la dirección del restaurante.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <>
      <TopAppBar
        title="Dar de Alta Restaurante"
        showBack={true}
        subtitle="Crowdsourcing Comunitario"
      />

      <main className="flex-1 flex flex-col px-space-md pt-3 pb-24 gap-4">
        {isSuccess ? (
          <div className="glass-panel rounded-2xl p-6 border border-primary/40 text-center flex flex-col items-center gap-3 my-auto">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-primary shadow-lg border border-primary/40">
              <span
                className="material-symbols-outlined text-[32px]"
                data-icon="verified"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <h2 className="font-headline-sm text-[20px] text-on-surface">
              ¡Restaurante Registrado con Éxito!
            </h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              El restaurante <strong className="text-on-surface">{name}</strong> ha sido agregado al mapa comunitario en estado de auditoría inicial.
            </p>
            <div className="flex gap-2 w-full pt-3">
              <Link
                href="/"
                className="flex-1 py-2.5 px-4 rounded-full bg-primary-container text-on-primary-container font-label-md text-[13px] font-semibold text-center"
              >
                Ver en el Mapa
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setName("");
                  setAddress("");
                  setHasPhoto(false);
                }}
                className="py-2.5 px-4 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface text-[13px] font-label-md"
              >
                Registrar Otro
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Banner Informativo */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0"
                data-icon="add_location"
              >
                add_location
              </span>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                ¿Descubriste un nuevo restaurante? Agrégalo al mapa para que la comunidad pueda visitarlo, evaluarlo y dejar sus opiniones.
              </p>
            </div>

            {/* Campo: Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                Nombre del Restaurante / Establecimiento *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Cantina del Sol, Omakase Sushi..."
                className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-body-sm text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/20"
                required
              />
            </div>

            {/* Campo: Cocina */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                Especialidad Gastronómica
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-body-sm text-[13px] text-on-surface focus:outline-none focus:border-primary-container"
              >
                <option value="Cocina Marina / Pescados">Cocina Marina / Pescados</option>
                <option value="Cocina Tradicional y Carnes">Cocina Tradicional y Carnes</option>
                <option value="Comida Callejera / Taquería">Comida Callejera / Taquería</option>
                <option value="Cocina Asiática / Omakase">Cocina Asiática / Omakase</option>
                <option value="Café de Especialidad y Panadería">Café de Especialidad y Panadería</option>
                <option value="Bistró Vegano / Orgánico">Bistró Vegano / Orgánico</option>
              </select>
            </div>

            {/* Campo: Dirección */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                Dirección o Zona *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Carrera 11 # 85-32, Zona Rosa..."
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl pl-4 pr-11 py-2.5 text-body-sm text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                  required
                />
                <button
                  type="button"
                  onClick={() => setAddress("Coordenadas actuales (GPS detectado)")}
                  className="absolute right-2 text-primary hover:text-white p-1"
                  title="Usar mi ubicación actual"
                >
                  <span className="material-symbols-outlined text-[19px]" data-icon="my_location">
                    my_location
                  </span>
                </button>
              </div>
            </div>

            {/* Foto de Fachada / Evidencia */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                Foto de Fachada o Menú (Opcional)
              </label>
              <button
                type="button"
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`w-full p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                  hasPhoto
                    ? "bg-secondary-container/40 border-primary/60 text-primary"
                    : "bg-surface-container-low/60 border-outline-variant/50 text-outline hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]" data-icon="add_a_photo">
                  add_a_photo
                </span>
                <span className="font-label-md text-[12px]">
                  {hasPhoto ? "✓ Foto Adjunta (fachada_local.webp)" : "Tocar para adjuntar foto de fachada"}
                </span>
              </button>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[15px] font-semibold tracking-tight shadow-[0_0_20px_rgba(123,153,160,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[19px]" data-icon="sync">
                      sync
                    </span>
                    <span>Registrando Establecimiento...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[19px]" data-icon="pin_drop">
                      pin_drop
                    </span>
                    <span>Publicar Restaurante en el Mapa</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <BottomNavBar />
    </>
  );
}
