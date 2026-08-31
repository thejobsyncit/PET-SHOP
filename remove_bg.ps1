Add-Type -AssemblyName System.Drawing

$inputPath = "public\logo.png"
$outputPath = "public\logo_transparent.png"

$img = [System.Drawing.Image]::FromFile((Join-Path (Get-Location) $inputPath))
$bmp = new-object System.Drawing.Bitmap($img)
$img.Dispose()

$bmp.MakeTransparent([System.Drawing.Color]::White)
$bmp.Save((Join-Path (Get-Location) $outputPath), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
