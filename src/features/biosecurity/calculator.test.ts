import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAggregateBiosecurityScore,
  calculateBiosecurityScore,
  derivePillarScoresFromChips,
  resolveBiosecurityLevel,
} from "./calculator.ts";
import {
  CreateRestaurantSchema,
  CreateReviewSchema,
} from "../../lib/validations/schemas.ts";
import {
  compressImageToWebP,
  validateImageFile,
} from "../../lib/image-compression.ts";
import {
  calculateHaversineDistanceKm,
  formatCoordinatesText,
  parsePostGISPoint,
} from "../../lib/geo.ts";

describe("Motor de Bioseguridad 40/35/15/10 y Regla de Veto Sanitario", () => {
  it("calcula 100.0 puntos y nivel aseptico cuando los 4 pilares tienen nota 5.0", () => {
    const res = calculateBiosecurityScore({
      scoreCritical: 5.0,
      scoreOperational: 5.0,
      scoreUtensils: 5.0,
      scoreDining: 5.0,
    });
    assert.equal(res.score, 100.0);
    assert.equal(res.level, "aseptico");
    assert.equal(res.summaryTier, "excelente");
    assert.equal(res.hasCriticalVeto, false);
    assert.equal(res.infractionsCount, 0);
  });

  it("aplica exactamente los pesos 40% Crítico, 35% Operativo, 15% Utensilios, 10% Salón", () => {
    // (4.0*0.40 + 5.0*0.35 + 3.0*0.15 + 2.0*0.10) * 20 = (1.6 + 1.75 + 0.45 + 0.20) * 20 = 4.0 * 20 = 80.0
    const res = calculateBiosecurityScore({
      scoreCritical: 4.0,
      scoreOperational: 5.0,
      scoreUtensils: 3.0,
      scoreDining: 2.0,
    });
    assert.equal(res.score, 80.0);
    assert.equal(res.level, "esterilizado");
    assert.equal(res.summaryTier, "excelente");
    assert.equal(res.hasCriticalVeto, false);
  });

  it("activa la Regla de Veto Sanitario cuando scoreCritical <= 2.0, truncando a 45.0 y forzando nivel alerta", () => {
    // Sin veto: (2.0*0.40 + 5.0*0.35 + 5.0*0.15 + 5.0*0.10)*20 = (0.8 + 1.75 + 0.75 + 0.5)*20 = 76.0
    // Con veto: truncado a 45.0 y nivel 'alerta'
    const res = calculateBiosecurityScore({
      scoreCritical: 2.0,
      scoreOperational: 5.0,
      scoreUtensils: 5.0,
      scoreDining: 5.0,
    });
    assert.equal(res.rawWeightedScore, 76.0);
    assert.equal(res.score, 45.0);
    assert.equal(res.level, "alerta");
    assert.equal(res.summaryTier, "alerta");
    assert.equal(res.hasCriticalVeto, true);
  });

  it("no activa el veto sanitario en el límite superior inmediato (scoreCritical = 2.1)", () => {
    const res = calculateBiosecurityScore({
      scoreCritical: 2.1,
      scoreOperational: 5.0,
      scoreUtensils: 5.0,
      scoreDining: 5.0,
    });
    assert.equal(res.hasCriticalVeto, false);
    assert.equal(res.score, 76.8);
    assert.equal(res.level, "antiseptico");
  });

  it("normaliza valores fuera de rango (clamping 1.0 a 5.0) y NaN sin lanzar excepciones", () => {
    const res = calculateBiosecurityScore({
      scoreCritical: -10,
      scoreOperational: 99,
      scoreUtensils: Number.NaN,
      scoreDining: 5.0,
    });
    assert.equal(res.hasCriticalVeto, true);
    assert.ok(res.score <= 45.0 && res.score >= 20.0);
    assert.equal(resolveBiosecurityLevel(85, false), "esterilizado");
  });

  it("deriva correctamente las notas de los 4 pilares desde los micro-chips", () => {
    const emptyPillars = derivePillarScoresFromChips([]);
    assert.equal(emptyPillars.scoreCritical, 1.0);
    assert.equal(emptyPillars.scoreOperational, 1.0);
    assert.equal(emptyPillars.scoreUtensils, 1.0);
    assert.equal(emptyPillars.scoreDining, 1.0);
  });

  it("replica BOOL_OR(score_critical <= 2.0) en múltiples auditorías agregadas aunque el promedio sea alto", () => {
    const agg = calculateAggregateBiosecurityScore([
      {
        scoreCritical: 5.0,
        scoreOperational: 5.0,
        scoreUtensils: 5.0,
        scoreDining: 5.0,
      },
      {
        scoreCritical: 2.0,
        scoreOperational: 5.0,
        scoreUtensils: 5.0,
        scoreDining: 5.0,
      },
    ]);
    // Promedio crítico es 3.5 -> rawWeightedScore = 88.0, pero BOOL_OR activa el veto a 45.0 y 'alerta'
    assert.equal(agg.rawWeightedScore, 88.0);
    assert.equal(agg.hasCriticalVeto, true);
    assert.equal(agg.score, 45.0);
    assert.equal(agg.level, "alerta");
  });
});

describe("Validación en los Bordes con Zod (Anti-Difamación y Bounding Box Colombia)", () => {
  it("rechaza reseñas con nota crítica <= 2.0 si el comentario tiene menos de 30 caracteres", () => {
    const invalid = CreateReviewSchema.safeParse({
      restaurantId: "los-maracuchos-gaira",
      scoreCritical: 1.8,
      scoreOperational: 4.0,
      scoreUtensils: 4.0,
      scoreDining: 4.0,
      selectedChips: [],
      comment: "Texto muy corto",
    });
    assert.equal(invalid.success, false);
  });

  it("acepta reseñas con nota crítica <= 2.0 cuando el comentario justifica el hallazgo con >= 30 caracteres", () => {
    const valid = CreateReviewSchema.safeParse({
      restaurantId: "los-maracuchos-gaira",
      scoreCritical: 1.8,
      scoreOperational: 4.0,
      scoreUtensils: 4.0,
      scoreDining: 4.0,
      selectedChips: [],
      comment:
        "No había agua potable ni jabón disponible en el lavamanos durante toda la noche.",
    });
    assert.equal(valid.success, true);
  });

  it("acepta coordenadas dentro de Colombia (ej. Gaira, Santa Marta) y rechaza coordenadas fuera del país", () => {
    const validGaira = CreateRestaurantSchema.safeParse({
      name: "Comidas Rápidas Los Maracuchos",
      cuisine: "Comida Rápida Zuliana",
      address: "Calle 6 # 12A-85, Edificio Brisas de Gaira, Gaira",
      city: "Santa Marta",
      lat: 11.1929,
      lng: -74.2238,
    });
    assert.equal(validGaira.success, true);

    const invalidOutsideColombia = CreateRestaurantSchema.safeParse({
      name: "Restaurante Fuera del País",
      cuisine: "Internacional",
      address: "Avenida Siempre Viva 123",
      city: "Madrid",
      lat: 40.4168,
      lng: -3.7038,
    });
    assert.equal(invalidOutsideColombia.success, false);
  });
});

describe("Geometría PostGIS (GeoJSON, WKT/EWKT y EWKB Hex) y Haversine", () => {
  it("parsea correctamente puntos PostGIS en formatos WKT/EWKT, GeoJSON y EWKB Hexadecimal", () => {
    const fromWkt = parsePostGISPoint("SRID=4326;POINT(-74.2238 11.1929)");
    assert.equal(fromWkt.lng, -74.2238);
    assert.equal(fromWkt.lat, 11.1929);
    assert.equal(
      formatCoordinatesText(fromWkt.lat, fromWkt.lng),
      "11.1929° N, 74.2238° O"
    );

    const fromGeoJSON = parsePostGISPoint({
      type: "Point",
      coordinates: [-75.5685, 6.2085],
    });
    assert.equal(fromGeoJSON.lng, -75.5685);
    assert.equal(fromGeoJSON.lat, 6.2085);

    // Construir un buffer EWKB real (little-endian = 1, type = 0x20000001, SRID = 4326, lng = -74.2238, lat = 11.1929)
    const buf = new ArrayBuffer(25);
    const view = new DataView(buf);
    view.setUint8(0, 1);
    view.setUint32(1, 0x20000001, true);
    view.setUint32(5, 4326, true);
    view.setFloat64(9, -74.2238, true);
    view.setFloat64(17, 11.1929, true);
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const fromEwkb = parsePostGISPoint(hex);
    assert.equal(fromEwkb.lng, -74.2238);
    assert.equal(fromEwkb.lat, 11.1929);

    const distKm = calculateHaversineDistanceKm(
      { lat: 11.1929, lng: -74.2238 },
      { lat: 11.2016, lng: -74.2282 }
    );
    assert.ok(distKm > 0.8 && distKm < 1.5);
  });
});

describe("Seguridad y Compresión WebP en Imágenes (Prevención XSS SVG y Reducción Progresiva < 150 KB)", () => {
  it("rechaza archivos vectoriales .svg y acepta formatos rasterizados permitidos", () => {
    const svgFile = new File(["<svg></svg>"], "malicioso.svg", {
      type: "image/svg+xml",
    });
    assert.equal(validateImageFile(svgFile).valid, false);

    const webpFile = new File(["webp-binary"], "fachada.webp", {
      type: "image/webp",
    });
    assert.equal(validateImageFile(webpFile).valid, true);
  });

  it("ejecuta compressImageToWebP reduciendo dimensiones progresivamente cuando una imagen de alta entropía supera 150 KB a 1200px", async () => {
    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    const origImage = globalThis.Image;
    const origDocument = globalThis.document;
    const origFileReader = globalThis.FileReader;

    try {
      URL.createObjectURL = () => "blob:mock-high-entropy";
      URL.revokeObjectURL = () => {};

      class MockImage {
        naturalWidth = 3000;
        naturalHeight = 2000;
        width = 3000;
        height = 2000;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_val: string) {
          queueMicrotask(() => this.onload?.());
        }
      }

      globalThis.Image = MockImage as unknown as typeof Image;

      globalThis.document = {
        createElement(tag: string) {
          assert.equal(tag, "canvas");
          return {
            width: 0,
            height: 0,
            getContext() {
              return {
                clearRect() {},
                drawImage() {},
              };
            },
            toBlob(
              cb: (b: Blob | null) => void,
              type: string,
              quality: number
            ) {
              assert.equal(type, "image/webp");
              // Simular imagen de alta entropía: a 1200px (incluso con q=0.42) pesa 180 KB (> 150 KB),
              // pero al reducir dimensiones del canvas baja a 92 KB (< 150 KB).
              const currentWidth = (this as { width: number }).width;
              const simulatedSize =
                currentWidth >= 1200 ? 180 * 1024 : Math.round(92 * 1024 * quality);
              cb(
                new Blob([new Uint8Array(simulatedSize)], {
                  type: "image/webp",
                })
              );
            },
          };
        },
      } as unknown as Document;

      class MockFileReader {
        result: string | null = null;
        onloadend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL() {
          this.result = "data:image/webp;base64,UklGRg==";
          queueMicrotask(() => this.onloadend?.());
        }
      }

      globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

      const rawHighEntropyPng = new File(
        [new Uint8Array(5 * 1024 * 1024)],
        "alta-entropia.png",
        { type: "image/png" }
      );

      const compressed = await compressImageToWebP(rawHighEntropyPng);
      assert.ok(compressed.compressedBytes <= 150 * 1024);
      assert.ok(compressed.width < 1200);
      assert.equal(compressed.file.name, "alta-entropia.webp");
      assert.equal(compressed.file.type, "image/webp");
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
      globalThis.Image = origImage;
      globalThis.document = origDocument;
      globalThis.FileReader = origFileReader;
    }
  });
});
