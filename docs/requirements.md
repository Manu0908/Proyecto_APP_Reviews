# Documento de Requisitos y Alcance del Sistema (SRS) — Proyecto Reseñas

**Versión:** 1.0.0-draft  
**Estado:** Fase 1 — Requisitos y Alcance Aprobado  
**Enfoque de Plataforma:** PWA Mobile-First (Responsive Desktop)  
**Stack Objetivo:** Next.js (App Router, TypeScript) + Supabase (PostgreSQL, Auth, Storage) + Tailwind CSS + MapLibre GL / OpenStreetMap.

---

## 1. Visión y Propósito del Producto
Plataforma comunitaria de auditoría y evaluación gastronómica centrada exclusivamente en **estándares de higiene, salubridad y transparencia sanitaria**. 

A diferencia de las plataformas tradicionales (donde la opinión está sesgada por el sabor o el precio), el valor diferenciador de esta solución radica en desglosar objetivamente las condiciones de salubridad del establecimiento a través de un índice multidimensional de higiene, evidencia fotográfica y verificación documental de visitas (tickets).

---

## 2. Actores del Sistema
1. **Comensal / Usuario Explorador (Anónimo):** Consulta el mapa, visualiza el semáforo/índice de higiene de locales y lee reseñas públicas.
2. **Inspector Comunitario (Usuario Registrado):** Califica locales en las 5 dimensiones de higiene, sube fotos de evidencia, adjunta ticket de compra para ganar insignia de "Visita Verificada" y acumula reputación de auditor.
3. **Propietario / Gerente de Negocio:** Reclama el perfil de su restaurante con evidencia de titularidad, responde públicamente a auditorías y solicita revisiones ante reportes de difamación infundada.
4. **Moderador / Administrador:** Atiende quejas de difamación, audita evidencias fotográficas dudosas y gestiona disputas de reclamos de negocio.

---

## 3. Matriz de Criticidad Sanitaria y Algoritmo de Calificación

Para evitar que aspectos cosméticos encubran riesgos biológicos reales, la evaluación no utiliza un promedio simple, sino una **jerarquía de 4 niveles de severidad** con **regla de veto sanitario**:

| Nivel de Severidad | Dimensión Evaluada | Peso Relativo | Regla de Veto / Impacto |
| :--- | :--- | :---: | :--- |
| **Nivel 1: Crítico (Biológico)** | • Control de Plagas y Olores<br>• Salubridad de Baños (agua, jabón, saneamiento) | **40%** | **Veto Sanitario:** Si este nivel promedia ≤ 2.0 estrellas, el local queda bloqueado para cualquier sello de excelencia, sin importar la nota de los demás niveles. |
| **Nivel 2: Operativo (Alimentos)** | • Higiene del Personal (redes, lavado, dinero/comida)<br>• Transparencia y aseo visible de cocina | **35%** | Previene contaminación cruzada e intoxicaciones alimentarias. |
| **Nivel 3: Contacto (Utensilios)** | • Vajilla, platos, vasos y cubiertos desinfectados | **15%** | Ausencia de grasa o residuos de clientes anteriores. |
| **Nivel 4: Confort (Salón)** | • Limpieza de mesas, sillas y ambiente general | **10%** | Aspecto estético y comodidad en sala. |

---

## 4. Escala de Bioseguridad (Ranking de Salubridad de 5 Niveles)

El establecimiento es categorizado según una narrativa visual y conceptual basada en pureza e higiene ambiental, huyendo del sistema genérico de estrellas:

| Nivel | Denominación | Metáfora Visual y Estética UI | Significado Operativo |
| :---: | :--- | :--- | :--- |
| **N1** | 🌿 **Elemental (u Orgánico)** | Texturas terrosas, musgo, tonos olivas/marrones, hojas silvestres. | Estado natural expuesto al entorno diario; carencia de protocolos preventivos o presencia de incidencias sanitarias. |
| **N2** | ⏳ **Filtrado** | Tonalidad ámbar/cobriza, efecto colador/tamiz. | Primer nivel de barrera higiénica; impurezas visibles retiradas, pero con debilidades en áreas críticas (baños o almacenamiento). |
| **N3** | 🛡️ **Antiséptico** | Azul clínico pulcro, verde menta esteril, escudo protector. | Estado seguro y protegido; estándares básicos e indispensables de salubridad garantizados (agua, jabón, orden). |
| **N4** | ⚡ **Esterilizado** | Violeta germicida, estética de radiación UV y acero inoxidable quirúrgico. | Cuidado meticuloso y protocolos constantes; personal con equipo de protección y cocina transparente impecable. |
| **N5** | 💎 **Aséptico / Inmune** | Blanco cian hiperbrillante, efecto cristal templado y halo de sala blanca (*cleanroom*). | Nivel definitivo de pureza de grado quirúrgico; cero contaminación cruzada, trazabilidad perfecta y auditorías impecables. |

---

## 5. Mecánicas Diferenciales e Innovación de Producto

1. **Modo Luz Negra (Filtro UV en Mapa):** Switch interactivo que invierte la paleta del mapa a visión nocturna fluorescente, destacando los establecimientos según la intensidad de su sello de pureza.
2. **Decaimiento Temporal de Reputación (Decay Rate):** Las auditorías pierden peso algorítmico progresivamente cada 60 días. Un local debe mantener actividad de higiene constante para evitar que su sello pierda brillo y pase a estado "Requiere re-inspección".
3. **Buzón de Incidencias Operativas (Aviso Privado B2B):** Permite al usuario alertar privadamente al negocio sobre faltantes menores (ej. dispensador de toallas vacío) concediendo 24 horas de gracia para subsanarlo antes de una reseña pública.
4. **Verificación OCR de Visita:** Extracción en cliente de la fecha y nombre en el ticket de compra para otorgar la insignia "Auditoría Verificada" de forma instantánea.
5. **Distintivo Físico de Escaparate:** Exportación de calcomanía en alta resolución con código QR dinámico para los restaurantes con Grado Esterilizado o Aséptico.

---

## 6. Experiencia de Calificación Móvil (Bandeja Táctil Tappable)

Para minimizar la fricción en celulares, la evaluación se realiza mediante un componente de **Bandeja Deslizante (*Bottom Sheet*)**:

1. **Acordeones Desplegables:** 4 módulos temáticos que el usuario puede abrir y calificar con toques.
2. **Micro-Chips Rápidos de 1 Toque:**
   - *Baños:* `[ Hay jabón ]`, `[ Agua corriente ]`, `[ Papel toalla ]`, `[ Sin malos olores ]`
   - *Personal:* `[ Usa red/cofia ]`, `[ No toca dinero y comida a la vez ]`, `[ Ropa de trabajo limpia ]`
   - *Vajilla:* `[ Cubiertos desinfectados ]`, `[ Vasos sin marcas ]`
   - *Mesas:* `[ Mesa limpia al sentarse ]`, `[ Piso impecable ]`
3. **Flujo de Reseña de Texto Inteligente:**
   - **Vía Rápida (15 segundos):** Para evaluaciones favorables (≥ 3.0), el campo de texto y las fotos son completamente **opcionales**. El usuario puede votar en 3 toques.
   - **Política Anti-Difamación:** Si se marca una calificación crítica (1 estrella en Plagas/Baños), el sistema **exige de forma obligatoria** un texto explicativo mínimo (30 caracteres) y sugiere adjuntar foto de prueba para respaldar la queja frente al restaurante.

---

## 7. Requisitos Funcionales por Módulos (Cascarón / Tabs del MVP)

### Tab 1: Explorador en Mapa (`/map`)
- Vista de mapa en pantalla completa (MapLibre GL + OpenStreetMap).
- Marcadores de restaurantes codificados por color según su semáforo de higiene (Verde, Amarillo, Rojo).
- Botón de geolocalización ("Centrar en mi ubicación").
- *Bottom Sheet* deslizante nativo en móvil: al tocar un pin en el mapa, despliega la ficha resumida del local (nombre, IPH general, distancia y botón para ver detalles completos).

### Tab 2: Directorio y Filtros (`/explore`)
- Barra de búsqueda con autocompletado de restaurantes.
- Filtros por: Nivel de higiene (Solo Verde, etc.), cercanía (km), tipo de comida y con "Visita Verificada".
- Lista de tarjetas de restaurantes con scroll infinito optimizado.

### Tab 3: Crear / Publicar (`/new`)
- **Acción Dual:** 
  1. Escribir Reseña de Higiene sobre un restaurante existente.
  2. Registrar un Nuevo Restaurante (nombre, dirección y pin en el mapa vía crowdsourcing).
- **Formulario de Reseña:**
  - Selector individual para cada una de las 5 dimensiones (1 a 5 estrellas).
  - Cuadro de comentarios con recordatorio de normas comunitarias de respeto y objetividad.
  - Subida de fotos de evidencia (comedor, baño, etc.).
  - Checkbox y cargador de foto de factura/ticket para badge "Visita Verificada".

### Tab 4: Ficha Detallada del Restaurante (`/restaurant/[id]`)
- Resumen visual del IPH y gráfico radar o barras con el desglose de los 5 criterios.
- Galería de fotos dividida en categorías (Comedor, Baños, Cocina, Plagas reportadas).
- Línea de tiempo de reseñas con filtro por fecha y verificación de ticket.
- Botón "¿Eres el dueño? Reclama este negocio".
- Respuestas oficiales del restaurante destacadas con badge oficial.

### Tab 5: Perfil de Usuario y Negocio (`/profile`)
- Datos del usuario e insignias de reputación ("Inspector Novato", "Auditor Sanitario").
- Historial de reseñas emitidas.
- Sección "Mis Negocios" para administradores de locales reclamados (acceso a bandeja de reportes y respuestas oficiales).

---

## 8. Prevención de Difamación y Reglas de Moderación
1. **Fase Inicial (Lanzamiento MVP):**
   - Publicación ágil para generar tracción comunitaria.
   - Botón visible "Reportar reseña" en cada opinión (motivos: difamación, falsedad comercial, spam, lenguaje ofensivo).
2. **Mecanismo de Salvaguarda de Negocios:**
   - Si una reseña califica con 1 estrella en C5 (Plagas) o IPH general < 2.0, el sistema notifica de inmediato al dueño del local (si está reclamado).
   - El dueño tiene derecho a réplica pública que se ancla directamente debajo de la acusación.
   - Reseñas con ticket verificado tienen una ponderación visual y de algoritmo superior a reseñas de cuentas anónimas sin comprobante.

---

## 9. Casos Límite y Consideraciones Técnicas
- **Offline / Conexión lenta en móvil:** Caché de mapa y de fichas de restaurantes visitados recientemente.
- **Tamaño de imágenes móviles:** Compresión obligatoria en el navegador antes de subir al bucket de Supabase (máx. 1200px de ancho, WebP, < 300KB) para ahorrar ancho de banda y cuota de almacenamiento.
- **Geocodificación inversa:** Permitir seleccionar el punto en el mapa arrastrando un pin si la dirección textual no se encuentra en OpenStreetMap.
