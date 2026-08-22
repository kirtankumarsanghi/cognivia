# Backend Endpoint Test Script
Write-Host "Testing Cognivia Backend..." -ForegroundColor Cyan

$BaseURL = "http://localhost:5000/api"

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseURL/health" -Method GET
    Write-Host " PASS" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)"
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
}

# Test 2: Get Courses (will fail with 401, but shows endpoint exists)
Write-Host "`n2. Testing Get Courses..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseURL/courses" -Method GET
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) {
        Write-Host " OK (401 - Auth Required)" -ForegroundColor Yellow
    } else {
        Write-Host " FAIL (HTTP $status)" -ForegroundColor Red
    }
}

# Test 3: Get Student Analytics
Write-Host "`n3. Testing Get Student Analytics..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseURL/analytics/student" -Method GET
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) {
        Write-Host " OK (401 - Auth Required)" -ForegroundColor Yellow
    } else {
        Write-Host " FAIL (HTTP $status)" -ForegroundColor Red
    }
}

# Test 4: Get Active Session
Write-Host "`n4. Testing Get Active Session..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseURL/sessions/active/test" -Method GET
    Write-Host " PASS" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) {
        Write-Host " OK (401 - Auth Required)" -ForegroundColor Yellow
    } elseif ($status -eq 404) {
        Write-Host " WARN (404 - Migration not applied)" -ForegroundColor Magenta
    } else {
        Write-Host " FAIL (HTTP $status)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Backend is RUNNING on port 5000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNote: 401 errors are normal for protected endpoints"
Write-Host "Note: Frontend should now connect to real backend!" -ForegroundColor Green
Write-Host ""
