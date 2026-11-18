$ErrorActionPreference = 'Stop'
$wt = 'C:\Users\Jam\AppData\Local\Temp\claude\eb7164b3a8a8609a\2ade3d67-588b-4a0d-82ef-8acf31aad402\scratchpad\wt\n1s'
$data = 'C:\Users\Jam\AppData\Local\Temp\claude\eb7164b3a8a8609a\2ade3d67-588b-4a0d-82ef-8acf31aad402\scratchpad\data\review2701-' + [guid]::NewGuid().ToString('N')
New-Item -ItemType Directory -Force $data | Out-Null
$env:DOTNET_ROOT = 'C:\Users\Jam\AppData\Local\mise\dotnet-root'
$env:DUPLICATI__WEBSERVICE_SUPPRESS_WELCOME_PAGE = 'true'
$base = 'http://localhost:8304'
$p = Start-Process -FilePath "$wt\Executables\Duplicati.Server\bin\Debug\net10.0\Duplicati.Server.exe" -ArgumentList '--webservice-port=8304', '--webservice-password=easy1234', "--server-datafolder=$data" -PassThru -WindowStyle Hidden
try {
  for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest "$base/" -UseBasicParsing | Out-Null; break } catch { Start-Sleep -Milliseconds 500 } }
  $tok = (Invoke-RestMethod -Method Post "$base/api/v1/auth/login" -ContentType 'application/json' -Body '{"Password":"easy1234","RememberMe":false}').AccessToken
  $h = @{ Authorization = "Bearer $tok" }
  $first = [DateTime]::UtcNow.AddHours(1).ToString('yyyy-MM-ddTHH:mm:00Z')
  $body = @{ Backup = @{ Name = 'probe'; Description = ''; TargetURL = 'file://' + ($data -replace '\\', '/') + '/target'; Sources = @("$data\"); Settings = @(@{ Name = 'passphrase'; Value = 'x' }); Filters = @(); Metadata = @{} }; Schedule = @{ Time = $first; Repeat = '1D'; Rule = '' } } | ConvertTo-Json -Depth 5
  $id = (Invoke-RestMethod -Method Post "$base/api/v1/backups" -Headers $h -ContentType 'application/json' -Body $body).ID
  Start-Sleep -Seconds 3
  $before = (Invoke-RestMethod "$base/api/v1/serverstate" -Headers $h).ProposedSchedule | Where-Object Item1 -eq $id
  "before skip ProposedSchedule: $($before.Item2)"

  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $ws.ConnectAsync([uri]"ws://localhost:8304/notifications?token=$tok", [Threading.CancellationToken]::None).Wait()
  $buf = [byte[]]::new(1MB)
  $script:pending = $null
  function Recv($ms) {
    $sb = [Text.StringBuilder]::new()
    do {
      if ($null -eq $script:pending) { $script:pending = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), [Threading.CancellationToken]::None) }
      if (-not $script:pending.Wait($ms)) { return $null }
      $r = $script:pending.Result; $script:pending = $null
      [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf, 0, $r.Count))
    } while (-not $r.EndOfMessage)
    return $sb.ToString()
  }
  $init = Recv 3000; "initial: " + ($init -replace "(.{300}).*","$1")
  while ($null -ne (Recv 1500)) {}  # drain
  $skip = Invoke-RestMethod -Method Post "$base/api/v1/backup/$id/skip-next-run" -Headers $h
  "skip response NextScheduledRun: $($skip.NextScheduledRun)"
  $n = 0
  while ($true) {
    $m = Recv 8000
    if ($null -eq $m) { break }
    $n++
    $j = $m | ConvertFrom-Json
    $d = if ($j.data) { $j.data } else { $j }
    $ps = $d.ProposedSchedule | Where-Object Item1 -eq $id
    "ws message $n type=$($j.type) ProposedSchedule for backup: $($ps.Item2)"
  }
  "ws messages after skip: $n (waited 8s idle)"
  $after = (Invoke-RestMethod "$base/api/v1/serverstate" -Headers $h).ProposedSchedule | Where-Object Item1 -eq $id
  "fresh GET serverstate ProposedSchedule: $($after.Item2)"
} finally {
  Get-Process Duplicati.Server -ErrorAction SilentlyContinue | Where-Object Path -like "$wt*" | Stop-Process -Force
}
