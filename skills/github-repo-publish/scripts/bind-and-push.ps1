[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$RepoUrl,

    [string]$Branch = "main",

    [string]$CommitMessage = "Initial commit",

    [switch]$SkipCommit,

    [switch]$ReplaceOrigin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw ("git {0} failed with exit code {1}" -f ($Args -join " "), $LASTEXITCODE)
    }
}

function Get-GitOutput {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    $output = & git @Args 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }
    return ($output | Out-String).Trim()
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git is not installed or not available in PATH."
}

$gitDir = Join-Path -Path (Get-Location) -ChildPath ".git"
if (-not (Test-Path -LiteralPath $gitDir)) {
    Invoke-Git init
}

$currentOrigin = Get-GitOutput remote get-url origin
if ($currentOrigin) {
    if ($currentOrigin -ne $RepoUrl) {
        if (-not $ReplaceOrigin) {
            throw "origin already points to '$currentOrigin'. Pass -ReplaceOrigin to overwrite it."
        }
        Invoke-Git remote set-url origin $RepoUrl
    }
}
else {
    Invoke-Git remote add origin $RepoUrl
}

$hasHead = [bool](Get-GitOutput rev-parse --verify HEAD)
$currentBranch = Get-GitOutput branch --show-current
if (-not $currentBranch) {
    Invoke-Git checkout -B $Branch
    $currentBranch = $Branch
}
elseif (-not $hasHead -and $currentBranch -ne $Branch) {
    Invoke-Git checkout -B $Branch
    $currentBranch = $Branch
}
elseif ($currentBranch -ne $Branch) {
    Write-Host ("Current branch is '{0}'. Pushing that branch." -f $currentBranch)
}

Invoke-Git add -A

$hasChanges = [bool](Get-GitOutput status --porcelain)
if ($hasChanges -and -not $SkipCommit) {
    $gitUserName = Get-GitOutput config user.name
    $gitUserEmail = Get-GitOutput config user.email

    if (-not $gitUserName -or -not $gitUserEmail) {
        throw "git user.name or user.email is not configured. Run 'git config user.name \"Your Name\"' and 'git config user.email \"you@example.com\"' before committing."
    }

    Invoke-Git commit -m $CommitMessage
}

$currentBranch = Get-GitOutput branch --show-current
if (-not $currentBranch) {
    $currentBranch = $Branch
}

Invoke-Git push -u origin $currentBranch

Write-Host ("Published branch '{0}' to '{1}'." -f $currentBranch, $RepoUrl)
