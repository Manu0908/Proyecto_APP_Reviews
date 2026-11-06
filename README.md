# Proyecto Reseñas

Aplicación móvil y web (PWA) enfocada en la evaluación y auditoría comunitaria de la higiene en restaurantes, centrada en un mapa interactivo.

---

## 1. Stack Tecnológico

- **Frontend:** Next.js (App Router, TypeScript) + Tailwind CSS.
- **Backend / Datos:** Supabase (PostgreSQL, PostGIS, Storage, Auth).
- **Mapas:** MapLibre GL + OpenStreetMap (sin costos de API de mapas en fase inicial).
- **Enfoque de Plataforma:** Mobile-first (diseño para celular adaptable a escritorio).

---

## 2. Modelo de Evaluación e Higiene

### 2.1. Criterios de Evaluación y Ponderación
La calificación final no es un promedio simple. Se divide en 4 niveles de severidad:

1. **Crítico / Biológico (40%):** Plagas, olores y salubridad de baños (agua y jabón).  
   *Regla de veto:* Si este nivel obtiene calificación reprobatoria ($\le 2.0$), el local no puede acceder a niveles superiores de certificación sin importar el resto de puntajes.
2. **Operativo / Alimentos (35%):** Higiene del personal (uso de redes, manipulación de dinero y comida por separado) y limpieza visible de la cocina.
3. **Contacto / Utensilios (15%):** Limpieza de platos, vasos y cubiertos.
4. **Confort / Salón (10%):** Limpieza de mesas, sillas y suelos.

### 2.2. Escala de Ranking (Visible en Ficha del Restaurante)
Para evitar saturación visual, estos nombres y grados solo se muestran dentro de la sección de ranking del restaurante:

- **Nivel 1 — Orgánico:** Expuesto al entorno diario, sin medidas preventivas o con fallas críticas (estética de tierra y elementos silvestres).
- **Nivel 2 — Filtrado:** Primer nivel de control; impurezas gruesas eliminadas, pero persisten fallas menores (estética ámbar).
- **Nivel 3 — Antiséptico:** Cumplimiento básico regular, agua, jabón y área protegida (estética azul/verde clínico).
- **Nivel 4 — Esterilizado:** Cuidado constante, protocolos estrictos de cocina y personal protegido (estética violeta / luz UV).
- **Nivel 5 — Aséptico / Inmune:** Máxima pureza, sin contaminación cruzada ni antecedentes críticos (estética de sala limpia / blanco cian quirúrgico).

---

## 3. Experiencia de Usuario (UX) Móvil

### 3.1. Navegación Principal (5 Tabs)
1. **Mapa:** Vista a pantalla completa con marcadores de restaurantes y *bottom sheet* deslizable al seleccionar un pin.
2. **Explorar:** Buscador y lista con filtros (cercanía, nivel de higiene, visitas verificadas).
3. **Calificar / Registrar:** Alta de nuevos restaurantes mediante pin y formulario de reseña.
4. **Ficha del Restaurante:** Detalle de ranking, desglose de criterios, galería de fotos y respuestas oficiales.
5. **Perfil:** Datos de usuario, historial de aportes y gestión de negocios reclamados.

### 3.2. Formulario de Calificación
- **Bandeja inferior táctil:** Acordeones colapsables por categoría con micro-chips de un toque (`[ Hay jabón ]`, `[ Agua continua ]`, `[ Red de pelo ]`).
- **Texto libre opcional:** Votación rápida sin obligación de escribir comentarios para experiencias regulares o positivas ($\ge 3.0$).
- **Control anti-difamación:** Si se marca calificación crítica ($\le 2.0$ o presencia de plagas), el sistema exige un comentario explicativo mínimo (30 caracteres) y sugiere adjuntar fotografía de evidencia.

---

## 4. Moderación y Gestión de Negocios

- **Publicación:** Inmediata para reducir fricción en el lanzamiento.
- **Reportes:** Botón visible para reportar difamación, datos falsos o spam.
- **Perfil de Negocio:** Los dueños pueden reclamar su establecimiento y publicar réplicas oficiales fijadas en las reseñas.
- **Visita Verificada:** Insignia otorgada a reseñas con fotografía de ticket de compra.

---

## 5. Sistema de Reputación de Inspectores

Los usuarios progresan en rangos comunitarios según la precisión y respaldo documental de sus auditorías:

- **Rangos:** Comensal Observador (R1) → Inspector de Zona (R2) → Auditor Verificado (R3) → Comisionado Sanitario (R4).
- **Métricas de Ascenso:**
  - Auditoría estándar con chips táctiles: +10 XP.
  - Auditoría con comprobante de consumo (ticket verificado): +50 XP.
  - Validaciones de la comunidad ("Diagnóstico Coincidente"): +5 XP.
- **Ponderación:** A mayor rango del inspector, mayor es el factor de confianza y peso relativo de su voto en el índice del restaurante.
- **Penalizaciones:** Acusaciones graves sin evidencia que resulten desmentidas conllevan deducción de XP y suspensión temporal.

---

## 6. Funciones Adicionales Planificadas

- **Modo UV en Mapa:** Opción de contraste nocturno que resalta visualmente los locales según su nivel de higiene.
- **Aviso Privado B2B (24h):** Opción para notificar fallas operativas menores al dueño antes de publicar una reseña negativa abierta.
- **Decaimiento Temporal:** Las calificaciones pierden peso tras 60 días si el local no recibe nuevas auditorías.
- **Insignia Física con QR:** Generación de distintivo imprimible para vitrina en locales de nivel Esterilizado o Aséptico.
