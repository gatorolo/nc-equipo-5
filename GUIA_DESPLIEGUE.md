# Guía de Despliegue: CRM Sagrada Madre

### 1. Base de Datos (Supabase)
1. Crea un proyecto en [Supabase](https://supabase.com/).
2. En **Settings > Database**, busca **Connection String** (modo URI) y cópialo.
   Ej: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`

### 2. Secretos en GitHub (¡CRUCIAL!)
Ve a tu repositorio en GitHub > **Settings > Secrets and variables > Actions** y añade estos "Repository secrets":

| Nombre del Secreto | Valor |
|-------------------|-------|
| `GCP_PROJECT_ID` | Tu ID de proyecto en Google Cloud |
| `GCP_SA_KEY` | El JSON de tu Service Account de Google |
| `DB_URL` | La URI de Supabase (paso 1) |
| `DB_USER` | Tu usuario de base de datos (ej: `postgres`) |
| `DB_PASSWORD` | Tu contraseña de Supabase |
| `JWT_SECRET` | Una clave larga aleatoria (ej: `mi-secreto-super-pro-2024`) |

### 3. Activar APIs en Google Cloud
Asegúrate de tener estas APIs activas en tu consola de Google:
- Cloud Run API
- Artifact Registry API
- Cloud Build API

---
¡Una vez que guardes los secretos en GitHub, el despliegue se disparará automáticamente!
