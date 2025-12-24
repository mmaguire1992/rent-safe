# Script to update react-router-dom imports to use compatibility layer
$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse | Where-Object { 
    (Get-Content $_.FullName -Raw) -match "from ['\`"]react-router-dom['\`"]"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace "from ['\`"]react-router-dom['\`"]", "from '@/lib/react-router-compat'"
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "Done! Updated $($files.Count) files."

