"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { createRestaurantAction } from "@/actions/restaurants.actions";
import {
  CompressedImageResult,
  compressImageToWebP,
} from "@/lib/image-compression";

export default function NewRestaurantPage() {
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("Cocina Marina / Pescados");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Santa Marta");
  const [lat, setLat] = useState<number>(11.1929);
  const [lng, setLng] = useState<number>(-74.2238);
  const [compressedPhoto, setCompressedPhoto] =
    useState<CompressedImageResult | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUseCurrentGps = () => {
    setErrorMessage(null);
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(4)));
          setLng(Number(pos.coords.longitude.toFixed(4)));
          if (!address.trim()) {
            setAddress("Ubicación verificada por GPS en Colombia");
          }
        },
        () => {
          setLat(11.1929);
          setLng(-74.2238);
          if (!address.trim()) {
            setAddress("Calle 6 # 12A-85, Sector Gaira, Santa Marta");
          }
        },
        { timeout: 5000 }
      );
    } else {
      setLat(11.1929);
      setLng(-74.2238);
      if (!address.trim()) {
        setAddress("Calle 6 # 12A-85, Sector Gaira, Santa Marta");
      }
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsCompressingPhoto(true);
    try {
      const compressed = await compressImageToWebP(file);
      setCompressedPhoto(compressed);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "No se pudo comprimir la foto de fachada."
      );
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await createRestaurantAction({
        name,
        cuisine,
        address,
        city,
        lat,
        lng,
        photoBytes: compressedPhoto?.compressedBytes,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch {
      setIsSubmitting(false);
      setErrorMessage("No fue posible registrar el establecimiento.");
    }
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
              El restaurante <strong className="text-on-surface">{name}</strong> ha sido validado y agregado al mapa comunitario en estado de auditoría inicial.
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
                  setCompressedPhoto(null);
                  setErrorMessage(null);
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

            {/* Campo: Cocina y Ciudad */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                  Especialidad
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-3 py-2.5 text-body-sm text-[12.5px] text-on-surface focus:outline-none focus:border-primary-container"
                >
                  <option value="Cocina Marina / Pescados">Cocina Marina / Pescados</option>
                  <option value="Cocina Tradicional y Carnes">Cocina Tradicional y Carnes</option>
                  <option value="Comida Callejera / Taquería">Comida Callejera / Taquería</option>
                  <option value="Cocina Asiática / Omakase">Cocina Asiática / Omakase</option>
                  <option value="Café de Especialidad y Panadería">Café de Especialidad y Panadería</option>
                  <option value="Bistró Vegano / Orgánico">Bistró Vegano / Orgánico</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                  Ciudad (Colombia)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Santa Marta"
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-3 py-2.5 text-body-sm text-[12.5px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                  required
                />
              </div>
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
                  placeholder="Ej. Calle 6 # 12A-85, Gaira..."
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl pl-4 pr-11 py-2.5 text-body-sm text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
                  required
                />
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="absolute right-2 text-primary hover:text-white p-1"
                  title="Usar mi ubicación actual"
                >
                  <span className="material-symbols-outlined text-[19px]" data-icon="my_location">
                    my_location
                  </span>
                </button>
              </div>
            </div>

            {/* Coordenadas validadas en Bounding Box Colombia */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  Latitud (Colombia)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-[12.5px] text-on-surface focus:outline-none focus:border-primary-container"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  Longitud (Colombia)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-xl px-3 py-2 text-body-sm text-[12.5px] text-on-surface focus:outline-none focus:border-primary-container"
                  required
                />
              </div>
            </div>

            {/* Foto de Fachada / Evidencia comprimida con Canvas API */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-[11px] text-outline uppercase tracking-wider">
                Foto de Fachada o Menú (Compresión WebP &lt; 150 KB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={isCompressingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 transition-all ${
                  compressedPhoto
                    ? "bg-secondary-container/40 border-primary/60 text-primary"
                    : "bg-surface-container-low/60 border-outline-variant/50 text-outline hover:border-primary/40"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]" data-icon="add_a_photo">
                  add_a_photo
                </span>
                <span className="font-label-md text-[12px] flex items-center gap-1">
                  {isCompressingPhoto ? (
                    "Comprimiendo a WebP y limpiando EXIF..."
                  ) : compressedPhoto ? (
                    <>
                      <span className="material-symbols-outlined text-[15px] text-teal-400">check</span>
                      <span>
                        {compressedPhoto.file.name} (
                        {(compressedPhoto.compressedBytes / 1024).toFixed(1)} KB WebP)
                      </span>
                    </>
                  ) : (
                    "Tocar para adjuntar foto de fachada"
                  )}
                </span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-rose-500/40 text-rose-200 text-[12px]">
                {errorMessage}
              </div>
            )}

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
