# Script to update all imports from @/pages to @/components/pages
$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse | Where-Object { 
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -and $content -match "from ['\`"]@/pages/"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace "from ['\`"]@/pages/", "from '@/components/pages/"
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "Done updating imports!"

