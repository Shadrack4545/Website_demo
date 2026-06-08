Render: set `VITE_ML_API_URL` and test frontend

1) Add environment variable to your Render Static Site

- Go to your Render Static Site settings for the frontend project.
- Under "Environment" / "Environment Variables" add:
  - Key: `VITE_ML_API_URL`
  - Value: `https://website-backend-demo.onrender.com` (replace with your backend URL if different)
- Save and trigger a redeploy (or wait for auto-deploy).

2) Verify the backend quickly from your machine

Run the PowerShell helper (from project root):

```powershell
# Windows PowerShell
.
\scripts\check_backend.ps1 -BackendUrl 'https://website-backend-demo.onrender.com'
```

This script prints `/api/health`, `/api/model_info`, and a sample `/api/batch_predict` response (raw JSON). If any step fails it prints the raw response body.

3) Seed demo data in the browser

- Run locally to print the seed IIFE:

```powershell
node scripts/seed-demo.js
```

- Copy the printed IIFE, open the deployed frontend `https://website-frontend-demo.onrender.com` in the browser, open DevTools (Console), paste the IIFE and press Enter. The page should reload writing demo data to `localStorage`.

4) Test predictions

- After reload, go to Predictions, select an event, and click Predict.
- Open Network and Console in DevTools and ensure no JSON parse errors appear.

5) If something still fails

- Paste the console and network raw response here.
- Or attach the output of `.
\scripts\check_backend.ps1` and I'll analyze it.
