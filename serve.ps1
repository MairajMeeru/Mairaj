param (
    [int]$Port = 5500,
    [switch]$NoBrowser
)

$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    $Port = 5501
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

Write-Host "Local server running at http://localhost:$Port/"

if (-not $NoBrowser) {
    Start-Process "http://localhost:$Port/"
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".jfif"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".mp4"   = "video/mp4"
    ".webm"  = "video/webm"
    ".pdf"   = "application/pdf"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".eot"   = "application/vnd.ms-fontobject"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath.EndsWith('/')) {
                $rawPath += "index.html"
            }

            $rawPath = $rawPath -replace '/', '\'
            $filePath = Join-Path $root $rawPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                if ($mimeTypes.ContainsKey($ext)) {
                    $response.ContentType = $mimeTypes[$ext]
                } else {
                    $response.ContentType = "application/octet-stream"
                }

                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Accept-Ranges", "bytes")

                $fileInfo = New-Object System.IO.FileInfo($filePath)
                $fileLength = $fileInfo.Length

                $rangeHeader = $request.Headers["Range"]
                if ($rangeHeader -and $rangeHeader.StartsWith("bytes=")) {
                    $range = $rangeHeader.Substring(6).Split('-')
                    [long]$start = 0
                    [long]$end = $fileLength - 1

                    if (![string]::IsNullOrEmpty($range[0])) {
                        $start = [long]::Parse($range[0])
                    }
                    if ($range.Length -gt 1 -and ![string]::IsNullOrEmpty($range[1])) {
                        $end = [long]::Parse($range[1])
                    }
                    if ($end -ge $fileLength) {
                        $end = $fileLength - 1
                    }
                    $length = $end - $start + 1

                    $response.StatusCode = 206
                    $response.Headers.Add("Content-Range", "bytes $start-$end/$fileLength")
                    $response.ContentLength64 = $length

                    if ($request.HttpMethod -ne "HEAD") {
                        $fs = [System.IO.File]::OpenRead($filePath)
                        try {
                            $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                            $buffer = New-Object byte[] 65536
                            [long]$bytesRemaining = $length
                            while ($bytesRemaining -gt 0) {
                                $bytesToRead = [int][Math]::Min($bytesRemaining, $buffer.Length)
                                $read = $fs.Read($buffer, 0, $bytesToRead)
                                if ($read -le 0) { break }
                                $response.OutputStream.Write($buffer, 0, $read)
                                $bytesRemaining -= $read
                            }
                        } finally {
                            $fs.Close()
                        }
                    }
                } else {
                    $response.StatusCode = 200
                    $response.ContentLength64 = $fileLength
                    if ($request.HttpMethod -ne "HEAD") {
                        $bytes = [System.IO.File]::ReadAllBytes($filePath)
                        $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                }
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            $response.OutputStream.Close()
        } catch {
            # ignore individual request errors/client disconnects
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
