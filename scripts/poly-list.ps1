$queries = @('terracotta','warrior','statue','bronze','bell','vase','pottery','ancient','artifact','helmet','mask','temple')
foreach($q in $queries){
  $url = "https://poly.pizza/search/$([uri]::EscapeDataString($q))"
  try {
    $html = (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 60).Content
  } catch {
    Write-Output "ERR $q"
    continue
  }
  $m = [regex]::Match($html, 'window\.__SERVER_APP_STATE__\s*=\s*(\{.*?\})</script>', 'Singleline')
  if(-not $m.Success){
    Write-Output "NO_MATCH $q"
    continue
  }
  $state = $m.Groups[1].Value | ConvertFrom-Json
  $results = $state.initialData.result
  Write-Output "`n=== $q (count=$($state.initialData.resultCount)) ==="
  foreach($it in ($results | Select-Object -First 18)){
    Write-Output ("{0,-12} | {1}" -f $it.publicID, $it.title)
  }
}
