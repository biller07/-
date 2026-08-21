param()

$ErrorActionPreference = 'Stop'
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))

$required = @(
  'AGENTS.md',
  'README.md',
  '.agents/README.md',
  '.agents/项目入口.json',
  '文档/开发协作/导航.md',
  '文档/开发协作/00-治理规则/产品边界.md',
  '文档/开发协作/00-治理规则/工程约束.md',
  '文档/开发协作/00-治理规则/多人协作协议.md',
  '文档/开发协作/00-治理规则/完成与提交标准.md',
  '文档/开发协作/01-架构契约/当前与目标架构.md',
  '文档/开发协作/01-架构契约/领域与状态契约.md',
  '文档/开发协作/01-架构契约/接口契约规则.md',
  '文档/开发协作/02-开发计划/总开发路线图.md',
  '文档/开发协作/02-开发计划/并行依赖关系.md',
  '文档/开发协作/04-交接与确认/提交前核对清单.md',
  '文档/开发协作/04-交接与确认/修改确认流程.md',
  '协作记录/导航.md',
  '协作记录/人员与对话/人员登记表.md',
  '协作记录/任务进度/工作流.json',
  '协作记录/任务进度/任务板.json',
  '协作记录/任务进度/开发进度总表.md',
  '协作记录/任务认领/说明.md',
  '协作记录/核对结果/核对报告模板.md',
  '协作记录/修改确认/修改确认模板.md',
  '协作记录/交接记录/开发交接模板.md',
  '协作记录/提交记录/提交规范.md'
)

foreach ($relative in $required) {
  $full = Join-Path $repoRoot $relative
  if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
    throw "缺少必需治理文件：$relative"
  }
}

$entry = Get-Content -LiteralPath (Join-Path $repoRoot '.agents/项目入口.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content -LiteralPath (Join-Path $repoRoot '协作记录/任务进度/工作流.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$board = Get-Content -LiteralPath (Join-Path $repoRoot '协作记录/任务进度/任务板.json') -Raw -Encoding UTF8 | ConvertFrom-Json

if ($entry.'真实支付启用' -ne $false) {
  throw '真实支付启用必须保持 false，直到支付与合规决策获批。'
}

$entryTargets = @($entry.'必读') + @($entry.'权威记录'.PSObject.Properties.Value)
foreach ($target in $entryTargets) {
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $target))) {
    throw "项目入口引用不存在：$target"
  }
}

$workstreams = @($registry.'工作流')
$workstreamIds = @($workstreams | ForEach-Object { $_.'编号' })
if (($workstreamIds | Select-Object -Unique).Count -ne $workstreamIds.Count) {
  throw '发现重复工作流编号。'
}

foreach ($workstream in $workstreams) {
  if (-not $workstream.'负责路径' -or $workstream.'负责路径'.Count -eq 0) {
    throw "工作流没有负责路径：$($workstream.'编号')"
  }
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $workstream.'说明文档') -PathType Leaf)) {
    throw "工作流说明文档不存在：$($workstream.'说明文档')"
  }
}

$tasks = @($board.'任务')
$taskIds = @($tasks | ForEach-Object { $_.'任务号' })
if (($taskIds | Select-Object -Unique).Count -ne $taskIds.Count) {
  throw '发现重复任务号。'
}

$personText = Get-Content -LiteralPath (Join-Path $repoRoot '协作记录/人员与对话/人员登记表.md') -Raw -Encoding UTF8
$personMatches = [regex]::Matches($personText, '(?m)^\|\s*(P-\d{3})\s*\|')
$personIds = @($personMatches | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
if ($personIds.Count -eq 0) {
  throw '人员登记表中没有有效的修改人编号。'
}

$statesRequiringCheck = @('待确认', '已确认', '已完成')
$statesRequiringConfirmation = @('待确认', '已确认', '已完成')
foreach ($task in $tasks) {
  if ($workstreamIds -notcontains $task.'工作流') {
    throw "任务引用未知工作流：$($task.'任务号') / $($task.'工作流')"
  }
  if ($board.'允许状态' -notcontains $task.'状态') {
    throw "任务状态不合法：$($task.'任务号') / $($task.'状态')"
  }
  if ($task.'进度百分比' -lt 0 -or $task.'进度百分比' -gt 100) {
    throw "任务进度超出 0 到 100：$($task.'任务号')"
  }
  if (-not $task.'负责路径' -or $task.'负责路径'.Count -eq 0) {
    throw "任务没有负责路径：$($task.'任务号')"
  }
  foreach ($dependency in @($task.'依赖')) {
    if ($taskIds -notcontains $dependency) {
      throw "任务引用未知依赖：$($task.'任务号') / $dependency"
    }
  }
  if ($task.'状态' -eq '可开始') {
    foreach ($dependency in @($task.'依赖')) {
      $dependencyTask = $tasks | Where-Object { $_.'任务号' -eq $dependency }
      if ($dependencyTask.'状态' -ne '已完成') {
        throw "任务标记为可开始但依赖未完成：$($task.'任务号') / $dependency"
      }
    }
  }
  if ($task.'负责人' -and $personIds -notcontains $task.'负责人') {
    throw "任务负责人未登记：$($task.'任务号') / $($task.'负责人')"
  }
  if ($statesRequiringCheck -contains $task.'状态') {
    if (-not $task.'核对报告' -or -not (Test-Path -LiteralPath (Join-Path $repoRoot $task.'核对报告') -PathType Leaf)) {
      throw "任务缺少核对报告：$($task.'任务号')"
    }
  }
  if ($statesRequiringConfirmation -contains $task.'状态') {
    if (-not $task.'修改确认' -or -not (Test-Path -LiteralPath (Join-Path $repoRoot $task.'修改确认') -PathType Leaf)) {
      throw "任务缺少修改确认：$($task.'任务号')"
    }
  }
}

$claimFiles = Get-ChildItem -LiteralPath (Join-Path $repoRoot '协作记录/任务认领') -Filter '认领-*.json' -File -ErrorAction SilentlyContinue
$activeClaims = @()
foreach ($claimFile in $claimFiles) {
  $claim = Get-Content -LiteralPath $claimFile.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($taskIds -notcontains $claim.'任务号') { throw "认领引用未知任务：$($claimFile.Name)" }
  if ($personIds -notcontains $claim.'修改人编号') { throw "认领引用未登记修改人：$($claimFile.Name)" }
  $claimTask = $tasks | Where-Object { $_.'任务号' -eq $claim.'任务号' }
  if ($claimTask.'负责人' -and $claimTask.'负责人' -ne $claim.'修改人编号') {
    throw "认领人与任务负责人不一致：$($claimFile.Name)"
  }
  if (@('开发中', '待核对', '待确认') -contains $claim.'状态') {
    if ([DateTimeOffset]::Parse($claim.'到期时间') -gt [DateTimeOffset]::Now) {
      $activeClaims += $claim
    }
  }
}

$duplicateActive = $activeClaims | Group-Object -Property '任务号' | Where-Object { $_.Count -gt 1 }
if ($duplicateActive) {
  throw "同一任务存在多个有效认领：$($duplicateActive.Name -join ', ')"
}

Write-Output "通过：必需文件 $($required.Count) 个"
Write-Output "通过：工作流 $($workstreams.Count) 条"
Write-Output "通过：任务 $($tasks.Count) 个"
Write-Output "通过：登记修改人 $($personIds.Count) 个"
Write-Output "通过：有效认领 $($activeClaims.Count) 个"
Write-Output '通过：真实支付仍处于关闭状态'
