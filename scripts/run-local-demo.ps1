<#
Run local demo environment and optionally build frontend for a public ngrok backend URL.

Usage:
1. Start this script after ensuring Python venv exists and Node deps are installed.
2. In one terminal run ngrok for the backend: `ngrok http 5000` and copy the https URL.
3. Run this script supplying the ngrok backend URL:
   .\scripts\run-local-demo.ps1 -NgrokBackendUrl "https://abcd-1234.ngrok.io"

What it does:
- Activates the Python venv, installs backend deps if missing, starts the Flask server in a new window.
- Builds the frontend with `VITE_ML_API_URL` set to the provided ngrok backend URL.
- Serves the `dist` folder locally (port 4173). You can then run ngrok for the frontend if you want a public frontend URL.

Note: This script assumes PowerShell on Windows.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$NgrokBackendUrl
)

function Ensure-VenvAndDeps {
    if (-not (Test-Path ".\.venv\Scripts\Activate.ps1")) {
        Write-Host "Creating virtualenv..."
        python -m venv .venv
    }
    Write-Host "Activating virtualenv..."
    & .\.venv\Scripts\Activate.ps1

    Write-Host "Installing backend requirements (if needed)..."
    pip install -r ml_backend/requirements.txt
}

function Start-Backend {
    Write-Host "Starting backend in a new PowerShell window..."
    Start-Process -NoNewWindow -FilePath pwsh -ArgumentList "-NoExit","-Command","python ml_backend/server.py"
    Write-Host "Backend started (check http://localhost:5000/api/health)"
}

function Build-And-Serve-Frontend {
    param([string]$BackendUrl)

    if (-not $BackendUrl) {
        Write-Host "No backend URL supplied. Build will use the default configured API URL in the code (if any)."
    } else {
        Write-Host "Setting VITE_ML_API_URL to $BackendUrl for build"
        $env:VITE_ML_API_URL = $BackendUrl
    }

    Write-Host "Installing node deps (if needed) and building frontend..."
    npm ci
    npm run build

    Write-Host "Serving built frontend (dist) on port 4173..."
    npx serve dist -l 4173
}

# --- Main
Ensure-VenvAndDeps
Start-Backend

if (-not $NgrokBackendUrl) {
    Write-Host ""
    Write-Host "Now run ngrok in another terminal: ngrok http 5000"
    Write-Host "Then re-run this script with the ngrok https URL as -NgrokBackendUrl parameter."
    exit 0
}

Build-And-Serve-Frontend -BackendUrl $NgrokBackendUrl
