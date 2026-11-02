param([Parameter(Mandatory)][ValidateSet('staging','production')][string]$Environment, [switch]$Apply)
$ErrorActionPreference = 'Stop'
$projectId = if ($Environment -eq 'staging') { 'corevent-staging-510316' } else { 'corevent' }
$projectNumber = if ($Environment -eq 'staging') { '666040325433' } else { '347427670211' }
$bucketName = if ($Environment -eq 'staging') { 'corevent-staging-bucket' } else { 'corevent' }
$branchName = if ($Environment -eq 'staging') { 'develop' } else { 'main' }
$apiAccount = if ($Environment -eq 'staging') { 'corevent-staging-api' } else { 'corevent-api' }
$apps = @(
    @{ Slug = 'app'; Repo = 'corevent/corevent_app'; RepositoryId = '1204233073' },
    @{ Slug = 'work'; Repo = 'corevent/corevent_work_app'; RepositoryId = '1437141681' }
)
$pool = 'github-apk'
$provider = "projects/$projectNumber/locations/global/workloadIdentityPools/$pool/providers/github"
$condition = "assertion.repository_owner_id == '263782429' && assertion.repository_id in ['1204233073','1437141681'] && assertion.ref == 'refs/heads/$branchName' && assertion.sub.endsWith(':environment:$Environment')"
if (-not $Apply) {
    @{ environment = $Environment; project = $projectId; bucket = $bucketName; provider = $provider; condition = $condition; apps = $apps } | ConvertTo-Json -Depth 5
    return
}

function Invoke-Gcloud([string[]]$Arguments) {
    & gcloud @Arguments --project=$projectId --quiet
    if ($LASTEXITCODE -ne 0) { throw "gcloud operation failed: $($Arguments[0..2] -join ' ')" }
}

function Test-CloudResource([string[]]$Arguments) {
    $result = & gcloud @Arguments --project=$projectId --quiet --format=json 2>&1
    if ($LASTEXITCODE -eq 0) { return $true }
    if (($result -join "`n") -match 'NOT_FOUND|not found|does not exist|404') { return $false }
    throw "Unable to inspect resource: $($result -join ' ')"
}

Invoke-Gcloud @('services','enable','iamcredentials.googleapis.com','sts.googleapis.com','storage.googleapis.com')

if (-not (Test-CloudResource @('iam','workload-identity-pools','describe',$pool,'--location=global'))) {
    Invoke-Gcloud @('iam','workload-identity-pools','create',$pool,'--location=global','--display-name=GitHub APK publishers')
}
if (-not (Test-CloudResource @('iam','workload-identity-pools','providers','describe','github',"--workload-identity-pool=$pool",'--location=global'))) {
    Invoke-Gcloud @('iam','workload-identity-pools','providers','create-oidc','github',"--workload-identity-pool=$pool",'--location=global',
        '--issuer-uri=https://token.actions.githubusercontent.com',
        '--attribute-mapping=google.subject=assertion.sub,attribute.repository_id=assertion.repository_id',
        "--attribute-condition=$condition")
} else {
    $existingProvider = (& gcloud iam workload-identity-pools providers describe github --workload-identity-pool=$pool --location=global --project=$projectId --format=json --quiet) | ConvertFrom-Json
    if ($existingProvider.attributeCondition -cne $condition) { throw 'Existing provider trust differs from the expected repository/branch/environment restriction.' }
}

foreach ($app in $apps) {
    $accountName = "github-apk-$($app.Slug)"
    $accountEmail = "$accountName@$projectId.iam.gserviceaccount.com"
    if (-not (Test-CloudResource @('iam','service-accounts','describe',$accountEmail))) {
        Invoke-Gcloud @('iam','service-accounts','create',$accountName,"--display-name=GitHub APK $($app.Slug) publisher")
    }
    $principal = "principalSet://iam.googleapis.com/projects/$projectNumber/locations/global/workloadIdentityPools/$pool/attribute.repository_id/$($app.RepositoryId)"
    Invoke-Gcloud @('iam','service-accounts','add-iam-policy-binding',$accountEmail,"--member=$principal",'--role=roles/iam.workloadIdentityUser')
    $prefix = "projects/_/buckets/$bucketName/objects/downloads/$($app.Slug)/"
    $bindingCondition = "expression=resource.name.startsWith('$prefix'),title=apk-$($app.Slug)-publisher"
    Invoke-Gcloud @('storage','buckets','add-iam-policy-binding',"gs://$bucketName","--member=serviceAccount:$accountEmail",'--role=roles/storage.objectAdmin',"--condition=$bindingCondition")
    $variables = @{
        APK_GCP_PROJECT_ID = $projectId; APK_GCS_BUCKET = $bucketName
        APK_MIN_VERSION_CODE = if ($Environment -eq 'production') { '2' } elseif ($app.Slug -eq 'app') { '17' } else { '1' }
        APK_GCP_WIF_PROVIDER = $provider; APK_GCP_SERVICE_ACCOUNT = $accountEmail
    }
    foreach ($entry in $variables.GetEnumerator()) {
        & gh variable set $entry.Key --repo $app.Repo --env $Environment --body $entry.Value
        if ($LASTEXITCODE -ne 0) { throw "Unable to set $($entry.Key) in $($app.Repo)" }
    }
}

# The runtime can read APKs and sign a short-lived read URL, without exposing the bucket.
$runtimeEmail = "$apiAccount@$projectId.iam.gserviceaccount.com"
Invoke-Gcloud @('storage','buckets','add-iam-policy-binding',"gs://$bucketName","--member=serviceAccount:$runtimeEmail",'--role=roles/storage.objectViewer',
    "--condition=expression=resource.name.startsWith('projects/_/buckets/$bucketName/objects/downloads/'),title=apk-download-reader")
if (-not (Test-CloudResource @('iam','roles','describe','apkDownloadSigner'))) {
    Invoke-Gcloud @('iam','roles','create','apkDownloadSigner','--title=APK download URL signer','--permissions=iam.serviceAccounts.signBlob','--stage=GA')
}
Invoke-Gcloud @('iam','service-accounts','add-iam-policy-binding',$runtimeEmail,"--member=serviceAccount:$runtimeEmail","--role=projects/$projectId/roles/apkDownloadSigner")
Write-Output "Configured APK publication for $Environment. No bucket was made public."
