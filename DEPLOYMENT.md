# Deployment Instructions

1. Required Node.js version: 18+
2. `npm install`
3. `npm run build`
4. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Netlify build command: `npm run build`
6. Netlify publish/output configuration: `.next`
7. Supabase configuration: Ensure URL and Anon Key are correctly set in the dashboard and environment.

Supabase setup:
- Database must be accessible and schema in `prisma/` applied.
