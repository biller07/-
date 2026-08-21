param()

$ErrorActionPreference = 'Stop'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

$required = @(
  'AGENTS.md',
  '.agents/project.json',
  '.agents/workstreams.json',
  '.agents/task-board.json',
  '.agents/claims/README.md',
  'docs/development/README.md',
  'docs/development/00-governance/product-boundaries.md',
  'docs/development/00-governance/engineering-constraints.md',
  'docs/development/00-governance/collaboration-protocol.md',
  'docs/development/00-governance/definition-of-done.md',
  'docs/development/01-architecture/current-target.md',
  'docs/development/01-architecture/domain-contract.md',
  'docs/development/01-architecture/api-contract-rules.md',
  'docs/development/02-plans/master-roadmap.md',
  'docs/development/02-plans/dependency-map.md',
  'docs/development/04-handoffs/handoff-template.md'
)

foreach ($relative in $required) {
  $full = Join-Path $repoRoot $relative
  if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
    throw "Missing required governance file: $relative"
  }
}

$project = Get-Content -LiteralPath (Join-Path $repoRoot '.agents/project.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content -LiteralPath (Join-Path $repoRoot '.agents/workstreams.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$board = Get-Content -LiteralPath (Join-Path $repoRoot '.agents/task-board.json') -Raw -Encoding UTF8 | ConvertFrom-Json

if ($project.realPaymentsEnabled -ne $false) {
  throw 'realPaymentsEnabled must remain false until an approved payment ADR exists.'
}

$workstreamIds = @($registry.workstreams | ForEach-Object { $_.id })
if (($workstreamIds | Select-Object -Unique).Count -ne $workstreamIds.Count) {
  throw 'Duplicate workstream id found.'
}

foreach ($workstream in $registry.workstreams) {
  if (-not $workstream.ownedPaths -or $workstream.ownedPaths.Count -eq 0) {
    throw "Workstream has no ownedPaths: $($workstream.id)"
  }
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $workstream.doc) -PathType Leaf)) {
    throw "Workstream document does not exist: $($workstream.doc)"
  }
}

$taskIds = @($board.tasks | ForEach-Object { $_.id })
if (($taskIds | Select-Object -Unique).Count -ne $taskIds.Count) {
  throw 'Duplicate task id found.'
}

foreach ($task in $board.tasks) {
  if ($workstreamIds -notcontains $task.workstreamId) {
    throw "Unknown workstream on task $($task.id): $($task.workstreamId)"
  }
  if ($board.allowedStatuses -notcontains $task.status) {
    throw "Invalid task status on $($task.id): $($task.status)"
  }
  if (-not $task.ownedPaths -or $task.ownedPaths.Count -eq 0) {
    throw "Task has no ownedPaths: $($task.id)"
  }
  foreach ($dependency in $task.dependsOn) {
    if ($taskIds -notcontains $dependency) {
      throw "Unknown dependency on task $($task.id): $dependency"
    }
  }
}

$claimFiles = Get-ChildItem -LiteralPath (Join-Path $repoRoot '.agents/claims') -Filter 'CLAIM-*.json' -File -ErrorAction SilentlyContinue
$activeClaims = @()
foreach ($claimFile in $claimFiles) {
  $claim = Get-Content -LiteralPath $claimFile.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($taskIds -notcontains $claim.taskId) { throw "Claim references unknown task: $($claimFile.Name)" }
  if ($claim.status -eq 'in_progress' -and [DateTimeOffset]::Parse($claim.expiresAt) -gt [DateTimeOffset]::UtcNow) {
    $activeClaims += $claim
  }
}

$duplicateActive = $activeClaims | Group-Object taskId | Where-Object { $_.Count -gt 1 }
if ($duplicateActive) {
  throw "Multiple active claims found for: $($duplicateActive.Name -join ', ')"
}

Write-Output "PASS governance files: $($required.Count)"
Write-Output "PASS workstreams: $($registry.workstreams.Count)"
Write-Output "PASS tasks: $($board.tasks.Count)"
Write-Output "PASS active claims: $($activeClaims.Count)"
