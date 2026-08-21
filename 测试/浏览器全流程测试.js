const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseURL = process.env.COMPUTEHUB_URL || 'http://127.0.0.1:4173';
const shots = path.join(__dirname, '界面截图');
fs.mkdirSync(shots, { recursive: true });

async function login(page, accountId = 'u1') {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.locator(`[data-login-account="${accountId}"]`).click();
  await page.locator('#loginSubmit').click();
  await page.locator('#marketView .hero').waitFor({ state: 'visible' });
}

async function switchAccount(page, accountId) {
  await page.locator('#sideProfile').click();
  await page.locator(`[data-switch-account="${accountId}"]`).click();
}

async function main() {
  const executablePath = process.env.PLAYWRIGHT_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  const watchErrors = page => {
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
    page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  };

  // Desktop publishing: homework tutoring is the primary category and no funds are frozen.
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await desktop.newPage();
  watchErrors(page);
  await login(page, 'u1');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(shots, '桌面端-需求市场.png'), fullPage: true });
  await page.locator('.top-publish').click();
  await page.locator('#taskTitle').fill('高等数学作业思路辅导与错题讲解');
  await page.locator('#taskCategory').selectOption({ label: '作业辅导' });
  await page.locator('#taskBudget').fill('321');
  await page.locator('#taskDeadline').fill('2026-09-10');
  await page.locator('#taskTags').fill('高等数学, 解题思路');
  await page.locator('#taskDescription').fill('需要一起梳理极限和导数题的解题思路，讲解错误原因，并完成一份可复习的步骤笔记。');
  await page.locator('#publishForm').evaluate(form => form.requestSubmit());
  await page.locator('#workspaceView.active-view [data-task-id]').filter({ hasText: '高等数学作业思路辅导与错题讲解' }).waitFor();
  await page.locator('[data-nav="wallet"]').first().click();
  await page.locator('#walletView.active-view .balance-amount').filter({ hasText: '12,860.80' }).waitFor();
  await desktop.close();

  // Full cross-account lifecycle: application -> selection -> chat -> delivery -> approval -> payment.
  const lifecycle = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const flow = await lifecycle.newPage();
  watchErrors(flow);
  await login(flow, 'u1');
  await flow.locator('#marketView.active-view [data-task-id="t1000"]').click();
  await flow.locator('[data-task-action="apply"]').click();
  await flow.locator('#proposal').fill('我会先检查数据字段和题目要求，再搭建清洗、统计和可视化代码框架，每一步都配合解释。');
  await flow.locator('#sample').fill('初版建议先用 isna 和 duplicated 做质量检查，再用 groupby 汇总品类销售额，并解释聚合结果。');
  await flow.locator('#applicationQuote').fill('300');
  await flow.locator('#applicationDays').fill('2');
  await flow.locator('#applicationForm').evaluate(form => form.requestSubmit());

  await switchAccount(flow, 'u2');
  await flow.locator('[data-nav="workspace"]').first().click();
  await flow.locator('[data-workspace-tab="created"]').click();
  await flow.locator('#workspaceView.active-view [data-task-id="t1000"]').click();
  await flow.locator('[data-task-action="applications"]').click();
  await flow.locator('.application-card').filter({ hasText: '陈默' }).waitFor();
  await flow.waitForTimeout(300);
  await flow.screenshot({ path: path.join(shots, '桌面端-报名列表.png'), fullPage: true });
  await flow.locator('[data-select-application]').click();
  await flow.locator('[data-task-action="chat"]').click();
  await flow.locator('#chatInput').fill('你先把数据清洗部分做成可运行初版，今晚我们一起确认三张图表的选择。');
  await flow.locator('#chatForm').evaluate(form => form.requestSubmit());
  await flow.getByText('你先把数据清洗部分做成可运行初版').waitFor();
  await flow.waitForTimeout(250);
  await flow.screenshot({ path: path.join(shots, '桌面端-订单沟通.png') });
  await flow.locator('[data-close-modal]').click();

  await switchAccount(flow, 'u1');
  await flow.locator('[data-nav="workspace"]').first().click();
  await flow.locator('[data-workspace-tab="accepted"]').click();
  await flow.locator('#workspaceView.active-view [data-task-id="t1000"]').click();
  await flow.locator('[data-task-action="chat"]').click();
  await flow.getByText('今晚我们一起确认三张图表的选择').waitFor();
  await flow.locator('#chatInput').fill('收到，我会先发清洗结果和字段说明，再等你确认可视化方向。');
  await flow.locator('#chatForm').evaluate(form => form.requestSubmit());
  await flow.locator('[data-close-modal]').click();
  await flow.locator('#workspaceView.active-view [data-task-id="t1000"]').click();
  await flow.locator('[data-task-action="deliver"]').click();
  await flow.locator('#deliveryNote').fill('已完成代码、三张图表和逐段讲解笔记，并附上可复现运行说明。');
  await flow.locator('#deliveryForm').evaluate(form => form.requestSubmit());

  await switchAccount(flow, 'u2');
  await flow.locator('[data-nav="workspace"]').first().click();
  await flow.locator('[data-workspace-tab="created"]').click();
  await flow.locator('#workspaceView.active-view [data-task-id="t1000"]').click();
  await flow.locator('[data-task-action="approve"]').click();
  await flow.locator('[data-task-action="pay"]').click();
  await flow.locator('[data-confirm-payment]').click();
  await flow.locator('#workspaceView.active-view [data-task-id="t1000"]').click();
  await flow.locator('.modal .status.completed').filter({ hasText: '已完成' }).waitFor();
  await flow.screenshot({ path: path.join(shots, '桌面端-已完成订单.png'), fullPage: true });
  await lifecycle.close();

  // Mobile: primary homework category, application form and bottom-sheet detail.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobile.newPage();
  watchErrors(mobilePage);
  await login(mobilePage, 'u1');
  if (!await mobilePage.locator('.mobile-nav').isVisible()) throw new Error('Mobile bottom navigation is not visible');
  const cards = await mobilePage.locator('.task-card').evaluateAll(nodes => nodes.slice(0, 2).map(n => n.getBoundingClientRect()));
  if (cards.length > 1 && Math.abs(cards[0].left - cards[1].left) > 2) throw new Error('Mobile cards are not in one column');
  await mobilePage.waitForTimeout(350);
  await mobilePage.screenshot({ path: path.join(shots, '手机端-首页.png'), fullPage: true });
  await mobilePage.locator('#marketView.active-view [data-task-id="t1000"]').click();
  await mobilePage.locator('[data-task-action="apply"]').click();
  await mobilePage.locator('#applicationForm').waitFor({ state: 'visible' });
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: path.join(shots, '手机端-报名表单.png') });
  await mobile.close();

  await browser.close();
  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('PASS homework-first publishing without escrow freeze');
  console.log('PASS application + owner selection + order chat + delivery + approval + payment');
  console.log('PASS mobile navigation + single-column layout + application sheet');
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
