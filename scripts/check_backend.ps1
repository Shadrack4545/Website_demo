param(
    [string]$BackendUrl = 'https://website-backend-demo.onrender.com'
)

Write-Host "Checking backend at: $BackendUrl" -ForegroundColor Cyan

# Health
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/api/health" -Method Get -ErrorAction Stop
    Write-Host "Health: " ($health | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "Health check failed:" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode.ToString() -ForegroundColor Yellow
    exit 1
}

# Model info
try {
    $info = Invoke-RestMethod -Uri "$BackendUrl/api/model_info" -Method Get -ErrorAction Stop
    Write-Host "Model info: " ($info | ConvertTo-Json -Depth 5) -ForegroundColor Green
} catch {
    Write-Host "Model info failed:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $raw = $sr.ReadToEnd();
        Write-Host "Raw response:`n$raw" -ForegroundColor Yellow
    }
    exit 1
}

# Batch predict example
$payload = @{
    event_id = 'E_TEST'
    predictions = @(
        @{ student_id = 'S1'; features = @(0.85,0.83,1,0,0,0.2,0,0) }
    )
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Sending test batch_predict request..." -ForegroundColor Cyan
    $resp = Invoke-RestMethod -Uri "$BackendUrl/api/batch_predict" -Method Post -Body $payload -ContentType 'application/json' -ErrorAction Stop
    Write-Host "batch_predict response:" ($resp | ConvertTo-Json -Depth 5) -ForegroundColor Green
} catch {
    Write-Host "batch_predict failed:" -ForegroundColor Red
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $raw = $sr.ReadToEnd();
        Write-Host "Raw response:`n$raw" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "All checks passed." -ForegroundColor Green
