# ==============================================================================
# Test Automation Configuration Module
# Shared constants and utility functions for all test automation scripts
# ==============================================================================

# --- Repository Configuration ---
$Script:CONFIG = @{
    SourceRepo       = "SkappHQ/skapp"
    E2eRepo          = "thusala/skapp-pm-e2e"
    E2eLocalPath     = "C:\Users\thusala.piyarisi_roo\Desktop\Desktop\SkappPM\skapp-pm\skapp-pm-e2e"
    DefaultBranch    = "main"
    DevelopBranch    = "develop"
    BaseBranch       = "develop"
    CopilotModel     = "claude-opus-4.6"
    BackendRoot      = "backend"
    FrontendRoot     = "frontend"
    JavaSrcRoot      = "backend/src/main/java/com/skapp"
    JavaTestRoot     = "backend/src/test/java/com/skapp"
    TestSupportPkg   = "backend/src/test/java/com/skapp/support"
    E2eTestDir       = "tests/api"
    E2eHelpersDir    = "tests/helpers"
}

# --- File Patterns ---
$Script:PATTERNS = @{
    JavaSource       = "*.java"
    JavaTest         = "*Test.java"
    IntegrationTest  = "*IntegrationTest.java"
    UnitTest         = "*UnitTest.java"
    TypeScriptTest   = "*.gen.test.ts"
    ExcludeDirs      = @("model", "payload", "type", "constant", "config", "mapper")
    TestablePackages = @("controller", "service", "util", "component", "repository")
}

# --- Test Naming Conventions ---
$Script:NAMING = @{
    IntegrationSuffix = "IntegrationTest"
    UnitSuffix        = "UnitTest"
    E2eSuffix         = ".gen.test.ts"
    TestDisplayName   = '{ClassName} Tests'
}

# --- API Configuration ---
$Script:API = @{
    BaseUrl         = "http://localhost:3000"
    ApiVersion      = "v1"
    AuthEndpoint    = "/v1/auth/sign-in"
    ContentType     = "application/json"
}

# ==============================================================================
# Utility Functions
# ==============================================================================

function Get-ProjectRoot {
    <#
    .SYNOPSIS
        Returns the project root directory
    #>
    $root = git rev-parse --show-toplevel 2>$null
    if (-not $root) {
        $root = (Get-Location).Path
    }
    return $root
}

function Get-ChangedJavaFiles {
    <#
    .SYNOPSIS
        Gets Java source files changed since the base branch
    .PARAMETER BaseBranch
        Branch to diff against (default: develop)
    #>
    param(
        [string]$BaseBranch = $Script:CONFIG.BaseBranch
    )

    $projectRoot = Get-ProjectRoot
    $changedFiles = git diff --name-only "origin/$BaseBranch" -- "$($Script:CONFIG.JavaSrcRoot)/**/*.java" 2>$null

    if (-not $changedFiles) {
        $changedFiles = git diff --name-only HEAD~5 -- "$($Script:CONFIG.JavaSrcRoot)/**/*.java" 2>$null
    }

    return $changedFiles | Where-Object {
        $file = $_
        $isExcluded = $false
        foreach ($dir in $Script:PATTERNS.ExcludeDirs) {
            if ($file -match "[\\/]$dir[\\/]") {
                $isExcluded = $true
                break
            }
        }
        -not $isExcluded
    }
}

function Get-TestableFiles {
    <#
    .SYNOPSIS
        Filters changed files to only those in testable packages without existing tests
    #>
    param(
        [string[]]$ChangedFiles
    )

    $testableFiles = @()
    foreach ($file in $ChangedFiles) {
        $isTestable = $false
        foreach ($pkg in $Script:PATTERNS.TestablePackages) {
            if ($file -match "[\\/]$pkg[\\/]") {
                $isTestable = $true
                break
            }
        }

        if ($isTestable) {
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file)
            $testPath = $file -replace "src/main/java", "src/test/java"
            $unitTestPath = $testPath -replace "\.java$", "$($Script:NAMING.UnitSuffix).java"
            $integTestPath = $testPath -replace "\.java$", "$($Script:NAMING.IntegrationSuffix).java"

            if (-not (Test-Path $unitTestPath) -and -not (Test-Path $integTestPath)) {
                $testableFiles += $file
            }
        }
    }

    return $testableFiles
}

function Test-Prerequisites {
    <#
    .SYNOPSIS
        Validates all required tools are installed
    #>
    $results = @{}

    # Check Java
    $results.Java = $null -ne (Get-Command java -ErrorAction SilentlyContinue)

    # Check Maven
    $results.Maven = (Test-Path "backend/mvnw") -or ($null -ne (Get-Command mvn -ErrorAction SilentlyContinue))

    # Check Node.js
    $results.Node = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

    # Check Git
    $results.Git = $null -ne (Get-Command git -ErrorAction SilentlyContinue)

    # Check GitHub CLI
    $results.GhCli = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)

    # Check Copilot CLI
    $results.Copilot = $null -ne (Get-Command copilot -ErrorAction SilentlyContinue)

    return $results
}

function Write-StepHeader {
    <#
    .SYNOPSIS
        Prints a formatted step header
    #>
    param(
        [int]$Step,
        [string]$Message
    )
    Write-Host ""
    Write-Host "[$Step] $Message" -ForegroundColor Cyan
    Write-Host ("-" * 60)
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Failure {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Get-JavaPackageName {
    <#
    .SYNOPSIS
        Extracts Java package name from a file path
    #>
    param([string]$FilePath)

    $normalized = $FilePath -replace "\\", "/"
    if ($normalized -match "java/(.+)/[^/]+\.java$") {
        return ($Matches[1] -replace "/", ".")
    }
    return ""
}

function Get-ClassName {
    <#
    .SYNOPSIS
        Extracts class name from a Java file path
    #>
    param([string]$FilePath)
    return [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
}

Export-ModuleMember -Function * -Variable CONFIG, PATTERNS, NAMING, API
