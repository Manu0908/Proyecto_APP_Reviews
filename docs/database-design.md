# Diseño de Base de Datos y Modelo Entidad-Relación — Proyecto Reseñas

**Motor:** PostgreSQL (Supabase) + Extensión `postgis`  
**Estado:** Preliminar (Fase 1 / 2)

---

## 1. Diagrama Entidad-Relación Conceptual

```mermaid
erDiagram
    PROFILES ||--o{ REVIEWS : "escribe"
    PROFILES ||--o{ BUSINESS_CLAIMS : "reclama"
    RESTAURANTS ||--o{ REVIEWS : "recibe"
    RESTAURANTS ||--o{ BUSINESS_CLAIMS : "posee"
    REVIEWS ||--o{ REVIEW_PHOTOS : "contiene"
    REVIEWS ||--o| BUSINESS_RESPONSES : "recibe réplica"
    REVIEWS ||--o{ REVIEW_REPORTS : "recibe reporte"

    PROFILES {
        uuid id PK
        text username
        text full_name
        text avatar_url
        text role "user | business_owner | moderator | admin"
        int reputation_score
        timestamp created_at
    }

    RESTAURANTS {
        uuid id PK
        text name
        text address
        geography location "Point (4326)"
        text category
        numeric avg_hygiene_score "Calculado 1.0 a 5.0"
        int total_reviews
        text cover_image_url
        uuid verified_owner_id FK
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid restaurant_id FK
        uuid user_id FK
        numeric score_tables "1.0 - 5.0"
        numeric score_bathrooms "1.0 - 5.0"
        numeric score_staff "1.0 - 5.0"
        numeric score_kitchen "1.0 - 5.0"
        numeric score_pests "1.0 - 5.0"
        numeric score_overall "Ponderado calculado"
        text comment
        boolean has_verified_ticket
        text ticket_photo_url
        text status "published | flagged | hidden"
        timestamp visit_date
        timestamp created_at
    }

    REVIEW_PHOTOS {
        uuid id PK
        uuid review_id FK
        text photo_url
        text area_tag "tables | bathrooms | staff | kitchen | pests | general"
        timestamp created_at
    }

    BUSINESS_RESPONSES {
        uuid id PK
        uuid review_id FK
        uuid owner_id FK
        text response_text
        timestamp created_at
    }

    REVIEW_REPORTS {
        uuid id PK
        uuid review_id FK
        uuid reporter_id FK
        text reason "defamation | false_info | offensive | spam"
        text status "pending | reviewed | dismissed"
        timestamp created_at
    }
```

---

## 2. Índices de Rendimiento y Restricciones
1. **Índice Espacial GiST:** `CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);` para consultas ultrarrápidas de proximidad (`ST_DWithin`).
2. **Restricción de Unicidad de Reseña por Visita:** Un usuario no puede publicar más de una reseña al mismo restaurante en un margen de 24 horas para prevenir ataques de desprestigio orquestados (*review bombing*).
3. **Trigger de Actualización de IPH:** Al insertar o modificar una reseña con estado `published`, un trigger de PostgreSQL recalcula automáticamente `avg_hygiene_score` y `total_reviews` en la tabla `restaurants`.

---

## 3. Políticas de Seguridad RLS (Row Level Security)
- **`restaurants`:** Lectura pública (`SELECT`) abierta a todos. Creación (`INSERT`) permitida a usuarios autenticados. Edición (`UPDATE`) restringida al `verified_owner_id` o `admin`.
- **`reviews`:** Lectura pública para reseñas en estado `published`. Inserción para usuarios autenticados. Edición y eliminación solo por el autor de la reseña (`auth.uid() = user_id`) o moderadores.
- **`business_responses`:** Inserción permitida únicamente al usuario cuyo `auth.uid()` coincida con el `verified_owner_id` del restaurante asociado a la reseña.
- **`review_reports`:** Inserción permitida a usuarios autenticados; lectura reservada para el reportero y el equipo de moderación.
