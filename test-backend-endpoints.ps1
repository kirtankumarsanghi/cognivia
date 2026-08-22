# Backend Endpoint Test Script
# Tests all API endpoints to verify backend-frontend connectivity

Write-Host "🧪 Cognivia Backend Endpoint Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BaseURL = "http://localhost:5000/api"
$TestResults = @()

# Helper function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    $Headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $Headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = "$BaseURL$Endpoint"
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Compress)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host " ✅ PASS" -ForegroundColor Green
        
        return @{
            Name = $Name
            Status = "PASS"
            Response = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host " ⚠️  HTTP $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host " ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        return @{
            Name = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
    }
}

Write-Host "Step 1: Test Health Check" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan
$result = Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/health"
$TestResults += $result
Write-Host ""

Write-Host "Step 2: Test Public Endpoints (No Auth)" -ForegroundColor Cyan
Write-Host "---------------------------------------" -ForegroundColor Cyan

# Test signup endpoint (will fail without database, but shows endpoint exists)
$signupBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "student"
}
$result = Test-Endpoint -Name "Complete Signup" -Method "POST" -Endpoint "/auth/complete-signup" -Body $signupBody
$TestResults += $result
Write-Host ""

Write-Host "Step 3: Test Protected Endpoints (Need Auth)" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Write-Host "Note: These will return 401 without valid token" -ForegroundColor Yellow
Write-Host ""

# Test protected endpoints (will fail with 401, but proves endpoint exists)
$endpoints = @(
    @{ Name = "Get Courses"; Method = "GET"; Endpoint = "/courses" },
    @{ Name = "Get Student Analytics"; Method = "GET"; Endpoint = "/analytics/student" },
    @{ Name = "Get Educator Analytics"; Method = "GET"; Endpoint = "/analytics/educator?courseId=cse2101" },
    @{ Name = "Get Confusion History"; Method = "GET"; Endpoint = "/confusion/history" },
    @{ Name = "Get Confusion Pulse"; Method = "GET"; Endpoint = "/confusion/pulse" },
    @{ Name = "Get Revision Plan"; Method = "GET"; Endpoint = "/revision/plan" },
    @{ Name = "Get Concept Graph"; Method = "GET"; Endpoint = "/concepts/graph" },
    @{ Name = "Get Practice Questions"; Method = "GET"; Endpoint = "/practice?concept_id=test" },
    @{ Name = "Get Study Group Matches"; Method = "GET"; Endpoint = "/study-groups/matches" },
    @{ Name = "Get Study Group Sessions"; Method = "GET"; Endpoint = "/study-groups/sessions" },
    @{ Name = "Get Notifications"; Method = "GET"; Endpoint = "/notifications" }
)

foreach ($ep in $endpoints) {
    $result = Test-Endpoint -Name $ep.Name -Method $ep.Method -Endpoint $ep.Endpoint
    $TestResults += $result
}

Write-Host ""
Write-Host "Step 4: Test Session Endpoints (Will fail if migration not applied)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan

$sessionEndpoints = @(
    @{ Name = "Get Active Session"; Method = "GET"; Endpoint = "/sessions/active/test-course" },
    @{ Name = "Start Session"; Method = "POST"; Endpoint = "/sessions/start"; Body = @{ course_id = "test"; title = "Test Session" } }
)

foreach ($ep in $sessionEndpoints) {
    $result = Test-Endpoint -Name $ep.Name -Method $ep.Method -Endpoint $ep.Endpoint -Body $ep.Body
    $TestResults += $result
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $TestResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($passCount -gt 0) {
    Write-Host "✅ Backend is RUNNING and responding!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is NOT responding properly" -ForegroundColor Red
}

Write-Host ""
Write-Host "Note: 401 errors are EXPECTED for protected endpoints without authentication" -ForegroundColor Yellow
Write-Host "Note: 404 errors mean the endpoint does not exist or migration not applied" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test with actual authentication:" -ForegroundColor Cyan
Write-Host "1. Login via frontend (http://localhost:5173)" -ForegroundColor White
Write-Host "2. Check browser DevTools -> Application -> Local Storage" -ForegroundColor White
Write-Host "3. Copy the sb-auth-token value" -ForegroundColor White
Write-Host "4. Extract the access_token from the JSON" -ForegroundColor White
Write-Host "5. Re-run this script with -Token parameter" -ForegroundColor White
Write-Host ""
