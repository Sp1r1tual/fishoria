$baseDir = "src"

function Get-RelativePath($from, $to) {
    $fromParts = $from.TrimEnd('\') -split '\\'
    $toParts   = $to   -split '\\'

    $common = 0
    while ($common -lt $fromParts.Count -and $common -lt $toParts.Count -and
           $fromParts[$common] -eq $toParts[$common]) {
        $common++
    }

    $upCount = $fromParts.Count - $common
    $rel = (@('..') * $upCount) + $toParts[$common..($toParts.Count - 1)]
    return $rel -join '/'
}

$allFiles = Get-ChildItem $baseDir -Recurse -Include *.ts |
    Where-Object { $_.FullName -notmatch "node_modules|\.spec\.ts" }

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $pattern = 'from\s+[''"]((src)/[^''"]+)[''"]'

    $newContent = [regex]::Replace($content, $pattern, {
        param($m)

        $importPath = $m.Groups[1].Value
        $fileDir    = Split-Path $file.FullName

        $targetPath = Join-Path (Get-Location) "$importPath.ts"

        if (-not (Test-Path $targetPath)) {
            $targetPath = Join-Path (Get-Location) $importPath "index.ts"
            if (-not (Test-Path $targetPath)) {
                Write-Warning "Not found: $importPath in $($file.Name)"
                return $m.Value
            }
        }

        $relativePath = Get-RelativePath $fileDir $targetPath
        $relativePath = $relativePath -replace '\.ts$', ''

        if ($relativePath -notmatch '^\.') { $relativePath = "./$relativePath" }

        return "from '$relativePath'"
    })

    if ($newContent -ne $content) {
        Set-Content $file.FullName $newContent -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
