param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
python (Join-Path $PSScriptRoot 'serve.py') --port $Port
