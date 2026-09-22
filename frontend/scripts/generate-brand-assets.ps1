# Generates the raster brand assets that SVG cannot cover:
#   public/apple-touch-icon.png   180x180
#   public/icon-192.png           192x192
#   public/icon-512.png           512x512
#   public/og-image.png           1200x630 social share card
#
# Uses System.Drawing (built into Windows PowerShell) so the repo needs no
# image toolchain dependency. Re-run with:  npm run assets
#
# The mark is redrawn here with the same 44-unit geometry as Logo.jsx and
# favicon.svg, so every asset stays visually identical.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'public'
if (-not (Test-Path $pub)) { New-Item -ItemType Directory -Path $pub | Out-Null }

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Mark([float]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::Transparent)

  $s = $size / 44.0

  # Device body with the same gradient as the SVG
  $body = New-RoundedPath (2 * $s) (2 * $s) (40 * $s) (40 * $s) (13 * $s)
  $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml('#171c24'),
    [System.Drawing.ColorTranslator]::FromHtml('#08090c'),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $g.FillPath($brush, $body)
  $brush.Dispose()

  # Inner hairline
  $inner = New-RoundedPath (2.75 * $s) (2.75 * $s) (38.5 * $s) (38.5 * $s) (12.35 * $s)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(41, 255, 255, 255), (1.5 * $s))
  $g.DrawPath($pen, $inner)
  $pen.Dispose()

  # Geometric S
  $penS = New-Object System.Drawing.Pen([System.Drawing.Color]::White, (3.6 * $s))
  $penS.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penS.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penS.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddLine(28.6 * $s, 14.6 * $s, 19.7 * $s, 14.6 * $s)
  $path.AddArc(15.65 * $s, 14.6 * $s, 8.1 * $s, 8.1 * $s, 270, 180)
  $path.AddLine(19.7 * $s, 22.7 * $s, 24.3 * $s, 22.7 * $s)
  $path.AddArc(20.25 * $s, 22.7 * $s, 8.1 * $s, 8.1 * $s, 270, -180)
  $path.AddLine(24.3 * $s, 30.8 * $s, 15.4 * $s, 30.8 * $s)
  $g.DrawPath($penS, $path)
  $penS.Dispose()

  # Accent indicator
  $dot = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#5b8cff'))
  $dr = 2.3 * $s
  $g.FillEllipse($dot, ((30.6 * $s) - $dr), ((30.4 * $s) - $dr), ($dr * 2), ($dr * 2))
  $dot.Dispose()

  $g.Dispose()
  return $bmp
}

# ---------------------------------------------------------------- icons ----
foreach ($size in 180, 192, 512) {
  $mark = New-Mark $size
  if ($size -eq 180) { $name = 'apple-touch-icon.png' }
  elseif ($size -eq 192) { $name = 'icon-192.png' }
  else { $name = 'icon-512.png' }
  $mark.Save((Join-Path $pub $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $mark.Dispose()
  Write-Output "wrote public/$name"
}

# ------------------------------------------------------------- og card ----
$W = 1200; $H = 630
$og = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'ClearTypeGridFit'
$g.InterpolationMode = 'HighQualityBicubic'

# Ink background
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#08090c'))

# Subtle grid veil
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(12, 255, 255, 255), 1)
for ($x = 0; $x -lt $W; $x += 56) { $g.DrawLine($gridPen, $x, 0, $x, $H) }
for ($y = 0; $y -lt $H; $y += 56) { $g.DrawLine($gridPen, 0, $y, $W, $y) }
$gridPen.Dispose()

# Cobalt glow, matching the site's hero treatment
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(-260, -260, 760, 760)
$glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(46, 91, 140, 255)
$glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 91, 140, 255))
$g.FillPath($glowBrush, $glowPath)
$glowBrush.Dispose(); $glowPath.Dispose()

# Mark + lockup
$mark = New-Mark 96
$g.DrawImage($mark, 80, 74, 96, 96)
$mark.Dispose()

$fWord = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Bold)
$bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.DrawString('Smartphone', $fWord, $bWhite, 196, 100)
$wWidth = $g.MeasureString('Smartphone', $fWord).Width
$bAccent = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#5b8cff'))
$g.DrawString('Cafe', $fWord, $bAccent, (196 + $wWidth - 8), 100)
$fWord.Dispose()

# Eyebrow
$fEye = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold)
$bMuted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#7b8698'))
$g.DrawString('SMARTPHONES  •  REPAIRS  •  ACCESSORIES', $fEye, $bMuted, 82, 232)
$fEye.Dispose()

# Headline
$fH = New-Object System.Drawing.Font('Segoe UI', 52, [System.Drawing.FontStyle]::Bold)
$g.DrawString('Your local smartphone', $fH, $bWhite, 78, 278)
$g.DrawString('store & repair shop.', $fH, $bWhite, 78, 344)
$fH.Dispose()

# Location line
$fL = New-Object System.Drawing.Font('Segoe UI', 21, [System.Drawing.FontStyle]::Regular)
$bBody = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#a8b1c0'))
$g.DrawString('Talegaon Station Road, Talegaon Dabhade, Maharashtra 410507', $fL, $bBody, 82, 432)
$fL.Dispose()

# Contact chips
$fC = New-Object System.Drawing.Font('Segoe UI', 19, [System.Drawing.FontStyle]::Bold)
$chipY = 496
$chipH = 52

function Add-Chip([string]$text, [float]$x, [System.Drawing.Color]$fill, [System.Drawing.Color]$fg) {
  $sz = $g.MeasureString($text, $fC)
  $w = $sz.Width + 52
  $p = New-RoundedPath $x $chipY $w $chipH 12
  $br = New-Object System.Drawing.SolidBrush($fill)
  $g.FillPath($br, $p)
  $br.Dispose(); $p.Dispose()
  $tb = New-Object System.Drawing.SolidBrush($fg)
  $g.DrawString($text, $fC, $tb, ($x + 26), ($chipY + 11))
  $tb.Dispose()
  return $w
}

$chipInk = [System.Drawing.Color]::FromArgb(20, 255, 255, 255)
$chipWa = [System.Drawing.ColorTranslator]::FromHtml('#128c3f')
$w1 = Add-Chip '+91 99225 99577' 82 $chipInk ([System.Drawing.Color]::White)
Add-Chip 'Open daily 10:00 AM - 9:30 PM' (82 + $w1 + 14) $chipWa ([System.Drawing.Color]::White) | Out-Null
$fC.Dispose()

# Bottom accent rule
$ruleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#2f6bff'))
$g.FillRectangle($ruleBrush, 0, ($H - 8), $W, 8)
$ruleBrush.Dispose()

$bWhite.Dispose(); $bMuted.Dispose(); $bBody.Dispose(); $bAccent.Dispose()
$g.Dispose()

$og.Save((Join-Path $pub 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()
Write-Output 'wrote public/og-image.png'

Write-Output 'Brand assets generated.'