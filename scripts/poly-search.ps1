function Get-PolySearchModels($query){
  $url = "https://poly.pizza/search/$([uri]::EscapeDataString($query))"
  $html = (Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 60).Content
  $m = [regex]::Match($html, 'window\.__SERVER_APP_STATE__\s*=\s*(\{.*?\})</script>', 'Singleline')
  if(-not $m.Success){
    Write-Output "NO_STATE for $query"
    return
  }
  $jsonText = $m.Groups[1].Value
  $state = $jsonText | ConvertFrom-Json
  $models = $state.initialData.models[0]
  Write-Output "`n=== $query | count=$($models.Count) ==="
  foreach($it in ($models | Select-Object -First 15)){
    "{0} | {1} | {2} | {3}" -f $it.publicID, $it.title, $it.licence, $it.url
  }
}

$queries = @('terracotta','warrior','bronze bell','bell','vase','jade','mask','ancient pot','artifact','museum')
foreach($q in $queries){
  try{ Get-PolySearchModels $q } catch { Write-Output "ERR $q : $($_.Exception.Message)" }
}
