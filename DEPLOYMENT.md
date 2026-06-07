# Deployment Guide — Frontend (Vercel) + Backend (Render)

This guide walks through the recommended deployment: frontend to Vercel (static Vite site) and backend to Render (Python or Docker). Follow one step at a time.

Prerequisites
- A GitHub account and the project pushed to a GitHub repository.
- Accounts on Vercel (https://vercel.com/) and Render (https://render.com/).
- Optional: Docker installed locally to test the container (`docker --version`).

1) Push to GitHub

- If you haven't already, create a repository and push the project. Example commands:

```powershell
git init
git add .
git commit -m "Initial commit: prepare for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

2) Backend — Render (recommended)

Option A: Deploy from GitHub using the included `Dockerfile` (recommended for exact reproducibility)

- In Render dashboard: New → Web Service → Connect repo → Choose branch (main) → Select "Docker" as environment.
- Render will build the Dockerfile located at `ml_backend/Dockerfile` and deploy the service.
- Environment variables to set in Render after creating service:
  - `ML_API_KEY` — (optional) token your frontend will pass in `Authorization` header.
  - `MODEL_PATH` — (optional) path to the model file in the service (default `trained_model.pkl`).

Option B: Deploy as a Python service (no Docker)

- In Render dashboard: New → Web Service → Connect repo → Select repo and branch.
- Set Build Command: `pip install -r ml_backend/requirements.txt`
- Set Start Command: `gunicorn "server:app" --bind 0.0.0.0:$PORT --workers 2`
- Set the same environment variables as above.

Notes:
- After Render finishes deploying, copy the service URL (e.g., `https://ml-backend.onrender.com`). Append `/api/health` to verify the health endpoint.
- If you want the backend to require an API key, add `ML_API_KEY` to Render and implement a token check in `server.py` (we can add that if you want).

3) Frontend — Vercel

- Go to https://vercel.com/new and import your GitHub repository.
- In Project settings or during import set:
  - Framework Preset: `Vite` (or Other)
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Add Environment Variables in Vercel (Project Settings → Environment Variables):
  - `VITE_ML_API_URL` = `https://<your-backend-url>` (the Render service URL)
  - `VITE_ML_API_KEY` = `<your_api_key>` (if you configured ML_API_KEY on the backend)
- Deploy. Vercel will provide a production URL once the build completes.

4) Test end-to-end

- Verify backend:
  - `GET https://<your-backend-url>/api/health`
  - `GET https://<your-backend-url>/api/model_info`
- Verify frontend:
  - Visit the Vercel URL and navigate to the Predictor page (admin-only). Use the seeded demo accounts or the seed script to create an admin user.
  - Trigger a prediction and check the network tab or Render logs to confirm the POST `/api/predict` call succeeded.

5) Fast fallback (ngrok) — use if backend or Render setup is delayed

- Run backend locally and expose with ngrok:

```powershell
# from project root
cd ml_backend
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py

# in another terminal, run ngrok (https://ngrok.com/)
ngrok http 5000
```

- Copy the ngrok HTTPS URL (e.g., `https://abcd-1234.ngrok.io`) and set `VITE_ML_API_URL` to it (either in Vercel preview env or in local `.env` when running frontend locally).

6) Troubleshooting
- If frontend cannot reach backend: check CORS and that `VITE_ML_API_URL` uses `https://`.
- If Render logs show model loading errors: ensure `trained_model.pkl`, `model_metadata.json`, and `feature_importance.json` are present in `ml_backend/`.
- If Vercel build fails: run `npm run build` locally and fix errors before re-deploying.

7) Collect artifacts for the report
- Save the Vercel frontend URL and Render backend URL.
- Capture screenshots of the Predictor page, a successful prediction, and the Render logs showing the request handling.

If you want, I can now:
- (A) Attempt a local Docker build to verify the `ml_backend/Dockerfile` (requires Docker installed).
- (B) Walk you through the Render web UI steps interactively (I will list exact clicks and values to enter).
- (C) Create a tiny helper script to call `/api/health` and `/api/predict` after deployment for quick verification.
