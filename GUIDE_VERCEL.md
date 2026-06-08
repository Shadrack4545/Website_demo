Vercel Deployment Guide
======================

Quick steps to deploy the frontend to Vercel and point it at the running Render backend.

1) Connect repository
- Sign in to Vercel (https://vercel.com).
- Import a new project -> choose the Git provider (GitHub) -> select `Shadrack4545/Website_demo`.

2) Project settings
- Root directory: `/` (repo root)
- Framework preset: `Vite` (Vercel usually detects this automatically)
- Build Command: `npm run build`
- Output Directory: `dist`

3) Environment variables
Add these environment variables in the Vercel dashboard for both "Preview" and "Production" (and optionally "Development"):

- `VITE_ML_API_URL` = `https://website-backend-demo.onrender.com`

4) Advanced / Optional: Vercel CLI
- Install CLI: `npm i -g vercel`
- Link the project (interactive): `vercel` (run from repo root)
- Add environment variable with CLI (example):

```powershell
vercel env add VITE_ML_API_URL production
# follow prompts to paste the value and confirm
```

5) Deploy and verify
- Trigger a deployment (Vercel does this automatically on push). Wait for deployment to finish.
- Verify the site: open the provided Vercel URL and then test the Event Predictor UI. The frontend uses `VITE_ML_API_URL` at runtime, so the site should pull model info and predictions from the Render backend.

6) Troubleshooting
- If the frontend shows CORS or 401 errors, confirm the backend `CORS` settings allow the Vercel domain.
- If the app fails to build, check build logs in Vercel; common fixes: ensure `node` version is compatible, and that `npm ci` runs successfully (add `engines` to `package.json` to pin Node if needed).

That's it — once deployed, open the Vercel URL and exercise the Event Predictor pages. If you'd like, I can trigger a verification run (test a prediction through the live frontend) after you deploy.
