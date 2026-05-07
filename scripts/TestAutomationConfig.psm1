# ==============================================================================
# Test Automation Configuration Module
# Shared constants and utility functions for all test automation scripts
# ==============================================================================

# --- Repository Configuration ---
$Script:CONFIG = @{
    SourceRepo       = "SkappHQ/skapp"
    AutomationRepo   = "thusala/skapp-automation"
    AutomationLocalPath = "C:\Users\thusala.piyarisi_roo\Desktop\NewCloneSkap\skapp-automation"
    AutomationBranch = "develop"
    DefaultBranch    = "main"
    DevelopBranch    = "develop"
    BaseBranch       = "develop"
    CopilotModel     = "claude-opus-4.6"
    BackendRoot      = "backend"
    FrontendRoot     = "frontend"
    JavaSrcRoot      = "backend/src/main/java/com/skapp"
    JavaTestRoot     = "backend/src/test/java/com/skapp"
    TestSupportPkg   = "backend/src/test/java/com/skapp/support"
    # UI test paths (in automation repo)
    UiTestModulesDir = "src/modules"
    UiTestSharedDir  = "src/shared"
    UiTestSetupDir   = "src/setup"
}

# --- Submodule Mapping ---
# Maps logical submodule names to their repo, local path, and layer
$Script:SUBMODULES = @{
    "backend-src" = @{
        Repo      = "rootcodelabs/skapp-ep-be-src"
        Path      = "backend/src/main/java/com/skapp/enterprise"
        Layer     = "backend"
        Type      = "source"
    }
    "backend-resources" = @{
        Repo      = "rootcodelabs/skapp-ep-be-resources"
        Path      = "backend/src/main/resources/enterprise"
        Layer     = "backend"
        Type      = "resources"
    }
    "backend-config" = @{
        Repo      = "rootcodelabs/skapp-ep-be-resources-config"
        Path      = "backend/src/main/resources/config"
        Layer     = "backend"
        Type      = "config"
    }
    "backend-test" = @{
        Repo      = "rootcodelabs/skapp-ep-be-tests"
        Path      = "backend/src/test/java/com/skapp/enterprise"
        Layer     = "backend"
        Type      = "test"
    }
    "frontend-src" = @{
        Repo      = "rootcodelabs/skapp-ep-fe-src"
        Path      = "frontend/src/enterprise"
        Layer     = "frontend"
        Type      = "source"
    }
    "frontend-pages" = @{
        Repo      = "rootcodelabs/skapp-ep-fe-pages"
        Path      = "frontend/pages/enterprise"
        Layer     = "frontend"
        Type      = "pages"
    }
    "frontend-api" = @{
        Repo      = "rootcodelabs/skapp-ep-fe-routes"
        Path      = "frontend/pages/api/enterprise"
        Layer     = "frontend"
        Type      = "api-routes"
    }
}

# --- File Patterns ---
$Script:PATTERNS = @{
    JavaSource       = "*.java"
    JavaTest         = "*Test.java"
    IntegrationTest  = "*IntegrationTest.java"
    UnitTest         = "*UnitTest.java"
    TypeScriptTest   = "*.gen.test.ts"
    FeUnitTest       = "*.test.ts", "*.test.tsx"
    ExcludeDirs      = @("model", "payload", "type", "constant", "config", "mapper")
    TestablePackages = @("controller", "service", "util", "component", "repository")
    # FE directories that are testable (utils, hooks, actions, store, validations)
    FeTestablePatterns = @("utils", "hooks", "actions", "store", "helpers")
    # FE files to skip (types, enums, constants, index barrels, styles)
    FeExcludePatterns  = @("types", "enums", "constants", "index\.ts$", "\.css$", "\.scss$", "\.json$", "QueryKeys", "configs")
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

# ==============================================================================
# Submodule / Cross-Repo Functions
# ==============================================================================

function Get-AffectedSubmodules {
    <#
    .SYNOPSIS
        Detects which submodules have changes on a feature branch
    .DESCRIPTION
        Iterates all configured submodules, checks if they are on a feature branch
        (matching the given branch name or any non-develop/main branch), and
        returns info about changed files in each.
    .PARAMETER FeatureBranch
        The feature branch name to look for (e.g. "feat/1979-work-location-add").
        If not provided, detects submodules on any non-default branch.
    .PARAMETER BaseBranch
        Branch to diff against within each submodule (default: develop)
    .OUTPUTS
        Array of hashtables with: Name, Repo, Path, Layer, Type, Branch, ChangedFiles, PRs
    #>
    param(
        [string]$FeatureBranch,
        [string]$BaseBranch = $Script:CONFIG.BaseBranch
    )

    $projectRoot = Get-ProjectRoot
    $affected = @()

    foreach ($name in $Script:SUBMODULES.Keys) {
        $sub = $Script:SUBMODULES[$name]
        $subPath = Join-Path $projectRoot $sub.Path

        if (-not (Test-Path $subPath)) { continue }

        Push-Location $subPath
        try {
            $currentBranch = git branch --show-current 2>$null

            # Skip if on default/develop branch (no feature work)
            if ($currentBranch -eq $Script:CONFIG.DefaultBranch -or
                $currentBranch -eq $Script:CONFIG.DevelopBranch) {
                continue
            }

            # If FeatureBranch specified, only include matching submodules
            if ($FeatureBranch -and $currentBranch -ne $FeatureBranch) {
                continue
            }

            # Get changed files in this submodule
            $changedFiles = git diff --name-only "origin/$BaseBranch" 2>$null
            if (-not $changedFiles) {
                $changedFiles = git diff --name-only HEAD~10 2>$null
            }

            if ($changedFiles) {
                $affected += @{
                    Name         = $name
                    Repo         = $sub.Repo
                    Path         = $sub.Path
                    Layer        = $sub.Layer
                    Type         = $sub.Type
                    Branch       = $currentBranch
                    ChangedFiles = @($changedFiles)
                }
            }
        }
        finally {
            Pop-Location
        }
    }

    return , $affected
}
function Get-FeatureBranchName {
    <#
    .SYNOPSIS
        Gets the current feature branch name from the parent repo or first submodule
    #>
    $projectRoot = Get-ProjectRoot
    Push-Location $projectRoot
    try {
        $branch = git branch --show-current 2>$null
        if ($branch -and $branch -ne $Script:CONFIG.DefaultBranch -and $branch -ne $Script:CONFIG.DevelopBranch) {
            return $branch
        }
    }
    finally {
        Pop-Location
    }

    # Fallback: check submodules for a feature branch
    foreach ($name in $Script:SUBMODULES.Keys) {
        $sub = $Script:SUBMODULES[$name]
        $subPath = Join-Path $projectRoot $sub.Path
        if (-not (Test-Path $subPath)) { continue }

        Push-Location $subPath
        try {
            $branch = git branch --show-current 2>$null
            if ($branch -and $branch -ne $Script:CONFIG.DefaultBranch -and $branch -ne $Script:CONFIG.DevelopBranch) {
                return $branch
            }
        }
        finally {
            Pop-Location
        }
    }

    return $null
}

function Get-SubmoduleChangedFiles {
    <#
    .SYNOPSIS
        Gets changed files from a specific submodule relative to its base branch
    .PARAMETER SubmoduleName
        The logical name from $SUBMODULES (e.g. "backend-src")
    .PARAMETER BaseBranch
        Branch to diff against
    .PARAMETER FileFilter
        Optional glob filter (e.g. "*.java", "*.ts")
    #>
    param(
        [Parameter(Mandatory)]
        [string]$SubmoduleName,
        [string]$BaseBranch = $Script:CONFIG.BaseBranch,
        [string]$FileFilter
    )

    if (-not $Script:SUBMODULES.ContainsKey($SubmoduleName)) {
        return @()
    }

    $sub = $Script:SUBMODULES[$SubmoduleName]
    $projectRoot = Get-ProjectRoot
    $subPath = Join-Path $projectRoot $sub.Path

    if (-not (Test-Path $subPath)) { return @() }

    Push-Location $subPath
    try {
        $files = git diff --name-only "origin/$BaseBranch" 2>$null
        if (-not $files) {
            $files = git diff --name-only HEAD~10 2>$null
        }

        if ($FileFilter -and $files) {
            $files = $files | Where-Object { $_ -like $FileFilter }
        }

        return @($files | Where-Object { $_ })
    }
    finally {
        Pop-Location
    }
}

function Get-AllChangedControllers {
    <#
    .SYNOPSIS
        Gets all changed Java controllers across community code AND enterprise submodule
    .DESCRIPTION
        Combines changes from:
        - Main repo community code: backend/src/main/java/com/skapp/community/**/controller/**
        - Enterprise submodule: backend/src/main/java/com/skapp/enterprise/**/controller/**
    .PARAMETER BaseBranch
        Branch to diff against
    #>
    param(
        [string]$BaseBranch = $Script:CONFIG.BaseBranch
    )

    $projectRoot = Get-ProjectRoot
    $controllers = @()

    # 1. Community controllers (main repo)
    Push-Location $projectRoot
    try {
        $communityFiles = git diff --name-only "origin/$BaseBranch" -- "backend/src/main/java/com/skapp/community/**/*.java" 2>$null
        if ($communityFiles) {
            $controllers += $communityFiles | Where-Object { $_ -match "[\\/]controller[\\/]" }
        }
    }
    finally {
        Pop-Location
    }

    # 2. Enterprise controllers (submodule)
    $enterpriseSub = $Script:SUBMODULES["backend-src"]
    if ($enterpriseSub) {
        $subPath = Join-Path $projectRoot $enterpriseSub.Path
        if (Test-Path $subPath) {
            Push-Location $subPath
            try {
                $entFiles = git diff --name-only "origin/$BaseBranch" 2>$null
                if ($entFiles) {
                    $entControllers = $entFiles | Where-Object { $_ -match "[\\/]controller[\\/]" -and $_ -like "*.java" }
                    # Prefix with submodule path for full context
                    $controllers += $entControllers | ForEach-Object { "$($enterpriseSub.Path)/$_" }
                }
            }
            finally {
                Pop-Location
            }
        }
    }

    # Filter out excluded dirs
    return $controllers | Where-Object {
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

function Get-CrossRepoContext {
    <#
    .SYNOPSIS
        Builds a comprehensive context summary of all changes across repos for a feature
    .DESCRIPTION
        Gathers changed files from all affected submodules and the main repo,
        categorizes them by layer (backend/frontend), and returns a structured object
        suitable for prompt building or PR body generation.
    .PARAMETER FeatureBranch
        The feature branch name
    #>
    param(
        [string]$FeatureBranch
    )

    if (-not $FeatureBranch) {
        $FeatureBranch = Get-FeatureBranchName
    }

    $projectRoot = Get-ProjectRoot
    $context = @{
        FeatureBranch     = $FeatureBranch
        AffectedRepos     = @()
        BackendChanges    = @()
        FrontendChanges   = @()
        Controllers       = @()
        TotalChangedFiles = 0
    }

    # Get affected submodules
    $affected = Get-AffectedSubmodules -FeatureBranch $FeatureBranch
    $context.AffectedRepos = $affected

    foreach ($sub in $affected) {
        if ($sub.Layer -eq "backend") {
            $context.BackendChanges += $sub.ChangedFiles | ForEach-Object { "$($sub.Path)/$_" }
            # Extract controllers
            $controllers = $sub.ChangedFiles | Where-Object { $_ -match "[\\/]controller[\\/]" -and $_ -like "*.java" }
            $context.Controllers += $controllers | ForEach-Object { "$($sub.Path)/$_" }
        }
        elseif ($sub.Layer -eq "frontend") {
            $context.FrontendChanges += $sub.ChangedFiles | ForEach-Object { "$($sub.Path)/$_" }
        }
        $context.TotalChangedFiles += $sub.ChangedFiles.Count
    }

    # Also include main repo (community) changes
    Push-Location $projectRoot
    try {
        $mainBranch = git branch --show-current 2>$null
        if ($mainBranch -and $mainBranch -ne $Script:CONFIG.DefaultBranch -and $mainBranch -ne $Script:CONFIG.DevelopBranch) {
            $mainChanges = git diff --name-only "origin/$($Script:CONFIG.BaseBranch)" 2>$null
            if ($mainChanges) {
                # Filter to actual source (not submodule pointer changes)
                $mainSourceChanges = $mainChanges | Where-Object {
                    $_ -notmatch "^(backend/src/main/java/com/skapp/enterprise|backend/src/main/resources/enterprise|backend/src/main/resources/config|backend/src/test/java/com/skapp/enterprise|frontend/src/enterprise|frontend/pages/enterprise|frontend/pages/api/enterprise)$"
                }
                $beChanges = $mainSourceChanges | Where-Object { $_ -like "backend/*" }
                $feChanges = $mainSourceChanges | Where-Object { $_ -like "frontend/*" }

                $context.BackendChanges += $beChanges
                $context.FrontendChanges += $feChanges
                $context.Controllers += $beChanges | Where-Object { $_ -match "[\\/]controller[\\/]" -and $_ -like "*.java" }
                $context.TotalChangedFiles += ($mainSourceChanges | Measure-Object).Count
            }
        }
    }
    finally {
        Pop-Location
    }

    return $context
}

function Get-ChangedFeFiles {
    <#
    .SYNOPSIS
        Gets changed frontend source files for a module that may need unit tests
    .PARAMETER Module
        Module name (people, leave, etc.)
    .PARAMETER BaseBranch
        Branch to diff against (default: develop)
    .OUTPUTS
        Array of hashtables: { RelativePath, FullPath, HasTest, TestPath, Directory }
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Module,
        [string]$BaseBranch = $Script:CONFIG.BaseBranch
    )

    $projectRoot = Get-ProjectRoot
    $feRoot = Join-Path $projectRoot $Script:CONFIG.FrontendRoot

    # Collect changed files from community FE code
    Push-Location $projectRoot
    $changedFiles = @()
    try {
        $gitDiff = git diff --name-only "origin/$BaseBranch" -- "frontend/src/community/$Module/**/*.ts" "frontend/src/community/$Module/**/*.tsx" 2>$null
        if (-not $gitDiff) {
            $gitDiff = git diff --name-only HEAD~10 -- "frontend/src/community/$Module/**/*.ts" "frontend/src/community/$Module/**/*.tsx" 2>$null
        }
        if ($gitDiff) { $changedFiles += $gitDiff }
    }
    finally { Pop-Location }

    # Also check enterprise FE submodule
    $epFeSub = $Script:SUBMODULES["frontend-src"]
    if ($epFeSub) {
        $subPath = Join-Path $projectRoot $epFeSub.Path
        if (Test-Path $subPath) {
            Push-Location $subPath
            try {
                $entFiles = git diff --name-only "origin/$BaseBranch" 2>$null
                if ($entFiles) {
                    $moduleFiles = $entFiles | Where-Object { $_ -match $Module -and ($_ -like "*.ts" -or $_ -like "*.tsx") }
                    $changedFiles += $moduleFiles | ForEach-Object { "$($epFeSub.Path)/$_" }
                }
            }
            finally { Pop-Location }
        }
    }

    # Filter to testable files only
    $testableFiles = @()
    foreach ($file in $changedFiles) {
        # Skip test files themselves
        if ($file -match "\.test\.(ts|tsx)$") { continue }

        # Skip excluded patterns
        $isExcluded = $false
        foreach ($pattern in $Script:PATTERNS.FeExcludePatterns) {
            if ($file -match "[\\/]$pattern[\\/]" -or $file -match $pattern) {
                $isExcluded = $true
                break
            }
        }
        if ($isExcluded) { continue }

        # Check if it's in a testable directory
        $isTestable = $false
        foreach ($dir in $Script:PATTERNS.FeTestablePatterns) {
            if ($file -match "[\\/]$dir[\\/]") {
                $isTestable = $true
                break
            }
        }
        if (-not $isTestable) { continue }

        # Determine if a test file already exists
        $fullPath = Join-Path $projectRoot $file
        $dir = Split-Path $fullPath -Parent
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file)
        # Handle .tsx -> .test.tsx and .ts -> .test.ts
        $ext = [System.IO.Path]::GetExtension($file)
        $testFileName = "$baseName.test$ext"
        $testPath = Join-Path $dir $testFileName
        $hasTest = Test-Path $testPath

        $testableFiles += @{
            RelativePath = $file
            FullPath     = $fullPath
            HasTest      = $hasTest
            TestPath     = $testPath
            Directory    = $dir
        }
    }

    return , $testableFiles
}

function Format-AffectedReposTable {
    <#
    .SYNOPSIS
        Formats affected repos as a markdown table for PR descriptions
    .PARAMETER AffectedSubmodules
        Output from Get-AffectedSubmodules
    #>
    param(
        [array]$AffectedSubmodules
    )

    $table = "| Repository | Layer | Branch | Changed Files |`n"
    $table += "|-----------|-------|--------|:------------:|`n"

    foreach ($sub in $AffectedSubmodules) {
        $table += "| ``$($sub.Repo)`` | $($sub.Layer) | ``$($sub.Branch)`` | $($sub.ChangedFiles.Count) |`n"
    }

    return $table
}

Export-ModuleMember -Function * -Variable CONFIG, PATTERNS, NAMING, API, SUBMODULES
