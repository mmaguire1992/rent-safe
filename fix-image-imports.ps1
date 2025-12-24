# Script to fix image imports - convert to direct path strings for Next.js public folder
$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse | Where-Object { 
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -and ($content -match "import.*from\s+['\`"]/images/")
}

foreach ($file in $files) {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content
    
    # Match import statements like: import logo from "/images/dashboard/logo.png";
    if ($content -match "import\s+(\w+)\s+from\s+['\`"](/images/[^'\`"]+)['\`"];?") {
        $varName = $matches[1]
        $imagePath = $matches[2]
        
        # Remove the import statement
        $newContent = $newContent -replace "import\s+$varName\s+from\s+['\`"]$imagePath['\`"];?\r?\n?", ""
        
        # Replace usage: {varName} with {imagePath} (as string)
        $newContent = $newContent -replace "\{$varName\}", "'$imagePath'"
        $newContent = $newContent -replace "src=\{${varName}\}", "src='$imagePath'"
        $newContent = $newContent -replace "src=\{$varName\}", "src='$imagePath'"
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.FullName) - Replaced $varName with '$imagePath'"
    }
}

Write-Host "Done fixing image imports!"

