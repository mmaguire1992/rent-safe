# Script to update image imports to use public folder
$imagePatterns = @{
    "@/assests/images/" = "/images/dashboard/"
    "@/assests/websiteImg/" = "/images/website/"
}

$files = Get-ChildItem -Path "src" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $updated = $false
    
    $newContent = $content | ForEach-Object {
        $line = $_
        foreach ($pattern in $imagePatterns.GetEnumerator()) {
            if ($line -match $pattern.Key) {
                $updated = $true
                $line = $line -replace [regex]::Escape($pattern.Key), $pattern.Value
                # Change import statement to use Next.js Image or direct path
                if ($line -match "import\s+\w+\s+from\s+['\`"]" + [regex]::Escape($pattern.Key)) {
                    # Extract the image name
                    if ($line -match "from\s+['\`"](.*)['\`"]") {
                        $oldPath = $matches[1]
                        $newPath = $oldPath -replace [regex]::Escape($pattern.Key), $pattern.Value
                        $imageName = Split-Path -Leaf $newPath
                        $line = $line -replace [regex]::Escape($oldPath), $newPath
                    }
                }
            }
        }
        $line
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done updating image paths!"

