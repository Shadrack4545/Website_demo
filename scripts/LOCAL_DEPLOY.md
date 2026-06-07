# Local hosting + ngrok fallback (fastest way to get a public URL)

Follow these steps to host both backend and frontend locally and get a public URL using `ngrok`.

Prerequisites
- Python 3.11+ and `python -m venv` available
- Node.js + npm
- ngrok (https://ngrok.com/) installed and logged in

Steps
1. Activate venv and start backend

```powershell
# from project root
python -m venv .venv      # only if venv not created yet
& .\.venv\Scripts\Activate.ps1
pip install -r ml_backend/requirements.txt
python ml_backend/server.py
```

2. In another terminal start ngrok for the backend

```powershell
ngrok http 5000
# Copy the https forwarding URL (e.g. https://abcd-1234.ngrok.io)
```

3. Build frontend pointing to the ngrok backend URL

```powershell
# From project root. Replace <NGROK_URL> with the https URL you copied
$env:VITE_ML_API_URL = "https://<NGROK_URL>"
npm ci
npm run build

# Serve the built site (you can choose a port)
npx serve dist -l 4173
```

4. (Optional) Expose the frontend via ngrok too

```powershell
ngrok http 4173
# Copy the https URL to share the full hosted platform
```

5. Verify
- Visit `https://<frontend-ngrok-url>` and navigate to Predictor. The frontend will call backend via `https://<backend-ngrok-url>/api/predict`.

If you prefer a single-command helper, use `scripts\run-local-demo.ps1` and pass the backend ngrok URL as argument after starting a backend ngrok tunnel:

```powershell
# Example (after running ngrok http 5000):
.\scripts\run-local-demo.ps1 -NgrokBackendUrl "https://abcd-1234.ngrok.io"
```
