"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Pista de interfaz que se muestra una única vez por dispositivo.
 * El estado se persiste en localStorage bajo `key`.
 *
 * Devuelve [pendiente, descartar]: `pendiente` es true si el usuario aún no la ha visto.
 * Se lee en un efecto (no durante el render) para evitar desajustes de hidratación SSR.
 */
export function useOneTimeHint(key: string): [boolean, () => void] {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    try {
      setPending(window.localStorage.getItem(key) !== "seen");
    } catch {
      // localStorage bloqueado (modo privado estricto): no mostrar la pista
      setPending(false);
    }
  }, [key]);

  const dismiss = useCallback(() => {
    setPending(false);
    try {
      window.localStorage.setItem(key, "seen");
    } catch {
      // Sin persistencia disponible: la pista solo se oculta en esta sesión
    }
  }, [key]);

  return [pending, dismiss];
}
