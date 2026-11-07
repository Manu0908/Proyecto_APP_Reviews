/**
 * Pipeline nativo de compresión de imágenes en el navegador (Canvas API -> WebP).
 *
 * Beneficios arquitectónicos ($0.00 USD/mes):
 * 1. Reduce fotos móviles de 5-12 MB a < 150 KB antes de enviarlas por la red.
 * 2. Elimina el 100% de los metadatos EXIF (coordenadas GPS privadas, serie del dispositivo)
 *    al redibujar el buffer de píxeles en un lienzo HTML5 limpio.
 * 3. Evita consumir el límite de 1.000 optimizaciones mensuales de Vercel Hobby.
 */

export const MAX_IMAGE_DIMENSION_PX = 1200;
export const MAX_COMPRESSED_BYTES = 150 * 1024; // 150 KB
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface CompressedImageResult {
  blob: Blob;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  compressedBytes: number;
  qualityUsed: number;
}

/**
 * Valida que el archivo sea una imagen rasterizada permitida (prohíbe SVG por riesgo XSS).
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".svg") || file.type === "image/svg+xml") {
    return {
      valid: false,
      error: "Por seguridad no se permiten archivos vectoriales SVG.",
    };
  }

  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: "Formato no soportado. Usa fotografías en formato JPG, PNG o WebP.",
    };
  }

  if (file.size > 20 * 1024 * 1024) {
    return {
      valid: false,
      error: "La imagen original supera el límite máximo de 20 MB.",
    };
  }

  return { valid: true };
}

/**
 * Carga un archivo File en un elemento HTMLImageElement.
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo decodificar la imagen seleccionada."));
    };
    img.src = objectUrl;
  });
}

/**
 * Convierte un HTMLCanvasElement a Blob con el formato y calidad indicados.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Error al codificar la imagen en formato WebP."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Convierte un Blob a Data URL para previsualización local inmediata.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo generar la vista previa de la imagen."));
      }
    };
    reader.onerror = () => reject(new Error("Error de lectura de imagen."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Comprime una imagen en el navegador a formato WebP (< 150 KB, máx 1200px)
 * eliminando por completo los metadatos EXIF.
 */
export async function compressImageToWebP(
  file: File,
  maxDimensionPx: number = MAX_IMAGE_DIMENSION_PX,
  maxBytes: number = MAX_COMPRESSED_BYTES
): Promise<CompressedImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const image = await loadImageFromFile(file);

  let targetWidth = image.naturalWidth || image.width;
  let targetHeight = image.naturalHeight || image.height;

  if (targetWidth > maxDimensionPx || targetHeight > maxDimensionPx) {
    if (targetWidth >= targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimensionPx) / targetWidth);
      targetWidth = maxDimensionPx;
    } else {
      targetWidth = Math.round((targetWidth * maxDimensionPx) / targetHeight);
      targetHeight = maxDimensionPx;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("El navegador no soporta contexto gráfico 2D para compresión.");
  }

  // Redibujar los píxeles elimina cualquier cabecera EXIF/IPTC/GPS original
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const qualitySteps = [0.82, 0.72, 0.62, 0.52, 0.42];
  let bestBlob: Blob | null = null;
  let usedQuality = qualitySteps[0];

  for (const q of qualitySteps) {
    usedQuality = q;
    const candidate = await canvasToBlob(canvas, "image/webp", q);
    bestBlob = candidate;
    if (candidate.size <= maxBytes) {
      break;
    }
  }

  // Si en imágenes de muy alta entropía el Blob a 1200px y calidad 0.42 aún supera maxBytes (150 KB),
  // reducimos progresivamente las dimensiones del lienzo para garantizar el cumplimiento de cuota.
  let downscalePass = 0;
  while (
    bestBlob &&
    bestBlob.size > maxBytes &&
    downscalePass < 4 &&
    canvas.width > 320 &&
    canvas.height > 320
  ) {
    downscalePass += 1;
    canvas.width = Math.max(320, Math.round(canvas.width * 0.78));
    canvas.height = Math.max(320, Math.round(canvas.height * 0.78));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    usedQuality = 0.38;
    bestBlob = await canvasToBlob(canvas, "image/webp", usedQuality);
  }

  if (!bestBlob) {
    throw new Error("Fallo inesperado al comprimir la fotografía.");
  }

  if (bestBlob.size > maxBytes) {
    throw new Error(
      "No fue posible comprimir la imagen por debajo del límite estricto de 150 KB."
    );
  }

  const cleanBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const compressedFile = new File([bestBlob], `${cleanBaseName || "evidencia"}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  const dataUrl = await blobToDataUrl(bestBlob);

  return {
    blob: bestBlob,
    file: compressedFile,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    originalBytes: file.size,
    compressedBytes: bestBlob.size,
    qualityUsed: usedQuality,
  };
}
