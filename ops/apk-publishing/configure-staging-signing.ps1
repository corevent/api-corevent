param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$repositories = @('corevent/corevent_app','corevent/corevent_work_app')
$secretNames = @('ANDROID_KEYSTORE_BASE64','ANDROID_STORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD')
foreach ($repository in $repositories) {
    $existing = (& gh secret list --repo $repository --env staging --json name | ConvertFrom-Json).name
    if ($LASTEXITCODE -ne 0) { throw "Cannot inspect staging secrets for $repository" }
    if ('ANDROID_KEYSTORE_BASE64' -in $existing) {
        if (@($secretNames | Where-Object { $_ -notin $existing }).Count) { throw "Incomplete existing staging signing configuration for $repository; refusing to replace its key." }
        Write-Output "$repository already has staging signing secrets; key preserved."
        continue
    }
    if (-not $Apply) { Write-Output "Will generate a dedicated staging signing key for $repository."; continue }
    $keyPath = Join-Path ([IO.Path]::GetTempPath()) ("corevent-staging-" + [guid]::NewGuid().ToString('N') + '.jks')
    $password = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $env:APK_SIGNING_PASSWORD = $password
    try {
        & keytool -genkeypair -keystore $keyPath -storetype JKS -alias staging -keyalg RSA -keysize 3072 -validity 10000 `
            -dname 'CN=Corevent Staging,OU=Development,O=Corevent,C=BR' `
            -storepass:env APK_SIGNING_PASSWORD -keypass:env APK_SIGNING_PASSWORD -noprompt 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Unable to generate staging signing key.' }
        $values = [ordered]@{
            ANDROID_STORE_PASSWORD = $password; ANDROID_KEY_PASSWORD = $password; ANDROID_KEY_ALIAS = 'staging'
            ANDROID_KEYSTORE_BASE64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keyPath))
        }
        foreach ($entry in $values.GetEnumerator()) {
            $stored = $false
            for ($attempt = 1; $attempt -le 3; $attempt++) {
                $entry.Value | & gh secret set $entry.Key --repo $repository --env staging
                if ($LASTEXITCODE -eq 0) { $stored = $true; break }
                Start-Sleep -Seconds 2
            }
            if (-not $stored) { throw "Unable to store staging secret $($entry.Key)." }
        }
        Write-Output "Configured fixed staging signing for $repository. Production secrets were not modified."
    } finally {
        Remove-Item Env:APK_SIGNING_PASSWORD -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $keyPath) { Remove-Item -LiteralPath $keyPath -Force }
        $password = $null
        $values = $null
    }
}
