$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ImageProcessor {
    public static void RemoveWhiteBackground(string inputPath, string outputPath) {
        using (Bitmap bmp = new Bitmap(inputPath)) {
            Bitmap newBmp = new Bitmap(bmp.Width, bmp.Height, PixelFormat.Format32bppArgb);
            
            for (int x = 0; x < bmp.Width; x++) {
                for (int y = 0; y < bmp.Height; y++) {
                    Color p = bmp.GetPixel(x, y);
                    // Check if near white
                    if (p.R > 240 && p.G > 240 && p.B > 240) {
                        newBmp.SetPixel(x, y, Color.Transparent);
                    } else {
                        newBmp.SetPixel(x, y, p);
                    }
                }
            }
            newBmp.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[ImageProcessor]::RemoveWhiteBackground((Join-Path (Get-Location) "public\logo_original.png"), (Join-Path (Get-Location) "public\logo.png"))
