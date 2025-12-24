# Script to add 'use client' to components that use hooks
$componentFiles = Get-ChildItem -Path "src\components" -Filter "*.jsx" -Recurse

foreach ($file in $componentFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Check if component uses hooks
        $usesHooks = $content -match "useState|useEffect|useNavigate|useParams|useSearchParams|useLocation|useRouter|usePathname"
        $hasUseClient = $content -match "^'use client'"
        
        if ($usesHooks -and -not $hasUseClient) {
            $newContent = "'use client'`r`n`r`n" + $content
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "Added 'use client' to: $($file.FullName)"
        }
    }
}

Write-Host "Done checking components!"

