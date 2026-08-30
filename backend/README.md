## Cogniva backend

1. Copy `backend/.env.example` to the repository root as `.env` and set the Supabase credentials.
2. Apply `database/schema.sql` and `database/seed.sql` to the Supabase database.
3. Run `npm run dev` from this directory. The API is served at `http://localhost:5000`.

`GEMINI_API_KEY` is optional: without it, the tutor exposes deterministic demo responses so the student flow still works.
