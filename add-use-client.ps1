# Script to add 'use client' directive to all page components that use hooks
$pageFiles = @(
    "src\pages\Login.jsx",
    "src\pages\ForgotPassword.jsx",
    "src\pages\OtpVerification.jsx",
    "src\pages\CreatePassword.jsx",
    "src\pages\PasswordSuccess.jsx",
    "src\pages\RoleSelection.jsx",
    "src\pages\owner\BasicInformation.jsx",
    "src\pages\owner\VerifyAccount.jsx",
    "src\pages\owner\SignupSuccess.jsx",
    "src\pages\renter\BasicInformation.jsx",
    "src\pages\renter\ShareThoughts.jsx",
    "src\pages\renter\SignupSuccess.jsx",
    "src\pages\Dashboard\Dashboard.jsx",
    "src\pages\MyProperties\MyProperties.jsx",
    "src\pages\AddProperty\AddProperty.jsx",
    "src\pages\PropertyDetail\PropertyDetail.jsx",
    "src\pages\Messages\Messages.jsx",
    "src\pages\PlansBilling\PlansBilling.jsx",
    "src\pages\VerificationCenter\VerificationCenter.jsx",
    "src\pages\ProfileSettings\ProfileSettings.jsx",
    "src\pages\Support\Support.jsx",
    "src\pages\TenantProfile\TenantProfile.jsx",
    "src\pages\RentalHistory.jsx",
    "src\pages\LandingPage.jsx",
    "src\pages\propertiesList.jsx",
    "src\pages\PropertyDetailPage.jsx",
    "src\pages\profileMangement.jsx",
    "src\pages\RentSupport.jsx",
    "src\pages\chat.jsx"
)

foreach ($file in $pageFiles) {
    $fullPath = Join-Path (Get-Location) $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -and -not ($content -match "^'use client'")) {
            # Add 'use client' at the very beginning if not present
            $newContent = "'use client'`r`n`r`n" + $content
            Set-Content -Path $fullPath -Value $newContent -NoNewline
            Write-Host "Added 'use client' to: $file"
        } else {
            Write-Host "Skipped (already has 'use client'): $file"
        }
    }
}

Write-Host "Done!"

