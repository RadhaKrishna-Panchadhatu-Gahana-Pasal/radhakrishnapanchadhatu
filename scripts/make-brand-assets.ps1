# Generates the brand assets used by the site from the Canva brand kit PNGs.
#
#   public/brand/logo-light.png     horizontal logo, ivory background removed
#   public/brand/logo-dark.png      same artwork with lightness inverted for dark UI
#   public/brand/app-icon-light.png square app icon (512px)
#   public/brand/app-icon-dark.png  square app icon for dark UI
#   public/icon.png                 favicon
#   public/apple-touch-icon.png iOS home screen icon
#   public/pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png
#
# Run from the repo root:  powershell -NoProfile -File scripts/make-brand-assets.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$brand = Join-Path $public 'brand'
$previewDir = Join-Path $root '.preview'
New-Item -ItemType Directory -Force -Path $brand, $previewDir | Out-Null

$darkSurface = 26, 24, 21

function ConvertTo-Hsl([int]$r, [int]$g, [int]$b) {
  $rf = $r / 255.0; $gf = $g / 255.0; $bf = $b / 255.0
  $max = [Math]::Max($rf, [Math]::Max($gf, $bf))
  $min = [Math]::Min($rf, [Math]::Min($gf, $bf))
  $l = ($max + $min) / 2.0
  if ($max -eq $min) { return @(0.0, 0.0, $l) }
  $d = $max - $min
  $s = if ($l -gt 0.5) { $d / (2.0 - $max - $min) } else { $d / ($max + $min) }
  if ($max -eq $rf) { $h = (($gf - $bf) / $d) % 6 }
  elseif ($max -eq $gf) { $h = (($bf - $rf) / $d) + 2 }
  else { $h = (($rf - $gf) / $d) + 4 }
  $h = $h / 6.0
  if ($h -lt 0) { $h += 1 }
  return @($h, $s, $l)
}

function Hue2Rgb([double]$p, [double]$q, [double]$t) {
  if ($t -lt 0) { $t += 1 }
  if ($t -gt 1) { $t -= 1 }
  if ($t -lt (1.0 / 6)) { return $p + ($q - $p) * 6 * $t }
  if ($t -lt 0.5) { return $q }
  if ($t -lt (2.0 / 3)) { return $p + ($q - $p) * ((2.0 / 3) - $t) * 6 }
  return $p
}

function ConvertFrom-Hsl([double]$h, [double]$s, [double]$l) {
  if ($s -eq 0) {
    $v = [int][Math]::Round($l * 255)
    return @($v, $v, $v)
  }
  $q = if ($l -lt 0.5) { $l * (1 + $s) } else { $l + $s - $l * $s }
  $p = 2 * $l - $q
  $r = [int][Math]::Round((Hue2Rgb $p $q ($h + (1.0 / 3))) * 255)
  $g = [int][Math]::Round((Hue2Rgb $p $q $h) * 255)
  $b = [int][Math]::Round((Hue2Rgb $p $q ($h - (1.0 / 3))) * 255)
  return @($r, $g, $b)
}

function New-ResizedBitmap([string]$path, [int]$width) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
  $height = [int][Math]::Round($img.Height * $width / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $width, $height)
  $g.Dispose()
  $img.Dispose()
  return $bmp
}

function New-PaddedSquare([System.Drawing.Bitmap]$source, [int]$size, [double]$scale) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 247, 245, 240))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $target = [int][Math]::Round($size * $scale)
  $offset = [int][Math]::Round(($size - $target) / 2)
  $g.DrawImage($source, $offset, $offset, $target, $target)
  $g.Dispose()
  return $bmp
}

# Ivory plate detection: the artwork sits on a warm cream background.
function Test-Ivory([System.Drawing.Color]$c) {
  return ($c.R -ge 232 -and $c.G -ge 224 -and $c.B -ge 204 -and
          ([Math]::Abs($c.R - $c.G) -lt 26) -and (($c.R - $c.B) -lt 44))
}

function New-ThemeVariant([System.Drawing.Bitmap]$source, [bool]$dark) {
  $w = $source.Width; $h = $source.Height
  $out = New-Object System.Drawing.Bitmap $w, $h
  for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
      $c = $source.GetPixel($x, $y)
      if (Test-Ivory $c) {
        if ($dark) {
          $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $darkSurface[0], $darkSurface[1], $darkSurface[2]))
        } else {
          $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        }
        continue
      }
      if ($dark) {
        $hsl = ConvertTo-Hsl $c.R $c.G $c.B
        $lightness = 1.0 - $hsl[2]
        if ($lightness -lt 0.16) { $lightness = 0.16 }
        if ($lightness -gt 0.95) { $lightness = 0.95 }
        $rgb = ConvertFrom-Hsl $hsl[0] ([Math]::Min(1.0, $hsl[1] * 0.96)) $lightness
        $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $rgb[0], $rgb[1], $rgb[2]))
      } else {
        $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
      }
    }
  }
  return $out
}

$horizontal = Join-Path $public 'Radhakrishna_Horizontal_Logo.png'
$icon = Join-Path $public 'Radhakrishna_App_Icon.png'

# --- horizontal lockup -------------------------------------------------------
$logoBase = New-ResizedBitmap $horizontal 900

$logoLight = New-ThemeVariant $logoBase $false
$logoLight.Save((Join-Path $brand 'logo-light.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$logoDark = New-ThemeVariant $logoBase $true
$logoDark.Save((Join-Path $brand 'logo-dark.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# --- square app icon ---------------------------------------------------------
$iconBase = New-ResizedBitmap $icon 512

$iconLight = New-ThemeVariant $iconBase $false
$iconLight.Save((Join-Path $brand 'app-icon-light.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$iconDark = New-ThemeVariant $iconBase $true
$iconDark.Save((Join-Path $brand 'app-icon-dark.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# --- favicon + installed app icons (keep the solid ivory plate) --------------
$iconOriginal = New-ResizedBitmap $icon 512
(New-PaddedSquare $iconOriginal 256 1.0).Save((Join-Path $public 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(New-PaddedSquare $iconOriginal 180 1.0).Save((Join-Path $public 'apple-touch-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(New-PaddedSquare $iconOriginal 192 1.0).Save((Join-Path $public 'pwa-192x192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(New-PaddedSquare $iconOriginal 512 1.0).Save((Join-Path $public 'pwa-512x512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(New-PaddedSquare $iconOriginal 512 0.78).Save((Join-Path $public 'pwa-maskable-512x512.png'), [System.Drawing.Imaging.ImageFormat]::Png)

# --- inspection previews on their real backgrounds --------------------------
function New-BackgroundPreview([System.Drawing.Bitmap]$logo, [int[]]$bg, [string]$outPath) {
  $canvas = New-Object System.Drawing.Bitmap ($logo.Width + 48), ($logo.Height + 48)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.Clear([System.Drawing.Color]::FromArgb(255, $bg[0], $bg[1], $bg[2]))
  $g.DrawImage($logo, 24, 24, $logo.Width, $logo.Height)
  $g.Dispose()
  $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
}

New-BackgroundPreview $logoLight @(255, 255, 255) (Join-Path $previewDir 'logo-light-check.png')
New-BackgroundPreview $logoDark @($darkSurface[0], $darkSurface[1], $darkSurface[2]) (Join-Path $previewDir 'logo-dark-check.png')

Write-Output 'brand assets written'
