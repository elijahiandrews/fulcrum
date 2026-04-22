# Run from repo root:  powershell -ExecutionPolicy Bypass -File ./scripts/push-vercel.ps1
# Pulls latest main, rebases your work, pushes — triggers Vercel production deploy.
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path .git)) { throw "Run this from the fulcrum monorepo root (parent of scripts/)." }
git pull --rebase origin main
git push origin main
Write-Host "Pushed origin/main. Open Vercel → Deployments to confirm the new build."
