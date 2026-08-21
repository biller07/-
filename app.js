(() => {
  'use strict';

  const STORAGE_KEY = 'computehub-prototype-v1';
  const statusMap = {
    open: ['开放报名', 'open'],
    in_progress: ['进行中', 'in_progress'],
    submitted: ['待验收', 'submitted'],
    pending_payment: ['待付款', 'pending_payment'],
    completed: ['已完成', 'completed']
  };
  const categories = ['全部', '作业辅导', '编程开发', '数据处理', '模型训练', 'AI 设计', '算力租用', '其他服务'];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = id => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const money = value => `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: Number(value) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const todayText = () => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace('/', '-');

  function seedState() {
    return {
      version: 2,
      sessionUserId: null,
      currentView: 'market',
      marketCategory: '全部',
      marketSort: 'recommend',
      marketSearch: '',
      workspaceTab: 'created',
      accounts: [
        { id: 'u1', name: '陈默', initials: '陈', role: 'AI 产品独立开发者', color: '#7357ed', balance: 12860.80, frozen: 2800, income: 15680, rating: 4.9, completed: 18, skills: ['LLM 应用', '数据处理', '产品设计'], verified: true },
        { id: 'u2', name: '林知夏', initials: '林', role: '数据标注工作室', color: '#20a98c', balance: 8340, frozen: 1200, income: 32800, rating: 4.8, completed: 42, skills: ['数据标注', '数据清洗', 'OCR'], verified: true },
        { id: 'u3', name: '周屿', initials: '周', role: 'GPU 算力服务商', color: '#e38a49', balance: 22350, frozen: 0, income: 61900, rating: 5.0, completed: 67, skills: ['GPU 算力', '模型部署', 'CUDA'], verified: true },
        { id: 'u4', name: '苏遥', initials: '苏', role: 'AI 视觉设计师', color: '#d85f80', balance: 6750, frozen: 2600, income: 28400, rating: 4.9, completed: 35, skills: ['AI 绘图', '视频生成', 'LoRA'], verified: true }
      ],
      tasks: [
        {
          id: 't1000', ownerId: 'u2', assigneeId: null, status: 'open', category: '作业辅导', budget: 320, settlement: 'direct',
          title: 'Python 数据分析课程作业辅导与代码讲解', summary: '需要共同梳理分析思路、完成代码调试，并讲清楚每一步为什么这样做。',
          description: '课程任务是使用 Pandas 分析一份公开销售数据，需要完成数据清洗、3 个可视化和一段结果解释。希望辅导者先给出初步思路或类似示例，再通过订单沟通一起完成。\n\n交付重点是可运行代码、逐段讲解和修改建议；不接受代考、冒名提交或无法解释来源的成品。',
          tags: ['Python', 'Pandas', '可视化', '代码讲解'], deadline: '2026-08-27', createdAt: '08-21 10:20', applications: [], timeline: [{ label: '辅导需求已发布，等待初版报名', time: '08-21 10:20' }]
        },
        {
          id: 't1001', ownerId: 'u2', assigneeId: null, status: 'open', category: '数据处理', budget: 1200, settlement: 'escrow',
          title: '为电商商品图完成 8,000 张精细分类标注', summary: '已整理原始图片与分类规范，需要交付可直接训练的数据集。',
          description: '对 8,000 张服饰商品图片进行多标签分类标注，标签包含品类、颜色、风格和季节。我们提供清晰的标注手册及 200 张已标注示例。\n\n交付格式为 JSONL，需要附带抽检说明，准确率目标不低于 97%。',
          tags: ['图像标注', 'JSONL', '数据质检'], deadline: '2026-08-28', createdAt: '08-21 09:30',
          applications: [
            { id: 'ap10011', applicantId: 'u3', proposal: '先用 200 张样例对齐分类口径，再分批标注并每 1,000 张做一次交叉抽检。', sample: '可以先免费交付 20 张标注样例和字段设计，确认后再进入正式任务。', quote: 1180, days: 5, status: 'pending', createdAt: '08-21 10:02' },
            { id: 'ap10012', applicantId: 'u4', proposal: '我会提供标注规范补充表、JSONL 转换脚本和最终抽检报告。', sample: '初版建议：颜色标签拆分为主色与辅色，避免多色商品训练时信息丢失。', quote: 1200, days: 4, status: 'pending', createdAt: '08-21 10:16' }
          ],
          timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-21 09:30' }, { label: '已收到 2 份初版报名', time: '08-21 10:16' }]
        },
        {
          id: 't1002', ownerId: 'u3', assigneeId: null, status: 'open', category: '编程开发', budget: 680, settlement: 'direct',
          title: '接入通义千问 API，搭建企业知识库问答 Demo', summary: '需要一个可演示的 RAG 问答页面，支持上传 PDF 和来源引用。',
          description: '使用通义千问 API 实现一个轻量 RAG 演示。前端支持上传 PDF、输入问题、展示回答和来源段落。可使用任意熟悉的向量库，交付源代码和运行说明。',
          tags: ['RAG', '通义千问', 'Python'], deadline: '2026-08-25', createdAt: '08-20 17:12', timeline: [{ label: '悬赏已发布', time: '08-20 17:12' }]
        },
        {
          id: 't1003', ownerId: 'u4', assigneeId: null, status: 'open', category: '模型训练', budget: 2600, settlement: 'escrow',
          title: '训练一套国风人物 LoRA，并产出 20 张样片', summary: '素材已完成筛选，希望获得可复用权重、触发词和参数说明。',
          description: '基于 92 张授权人物素材训练 SDXL LoRA。风格要求写实、克制、保留东方审美。需要交付 safetensors 权重、训练参数、推荐触发词及 20 张不同场景测试图。',
          tags: ['SDXL', 'LoRA', 'AI 绘图'], deadline: '2026-09-02', createdAt: '08-20 14:05', timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-20 14:05' }]
        },
        {
          id: 't1004', ownerId: 'u1', assigneeId: 'u2', status: 'submitted', category: '数据处理', budget: 2800, settlement: 'escrow',
          title: '清洗 12 万条中文客服对话并完成意图分类', summary: '数据已交付，等待发布方在线验收。',
          description: '清洗脱敏后的客服对话语料，去除重复与无效对话，并按 18 类意图标签完成分类。交付 CSV、标签字典和质检报告。',
          tags: ['NLP', '数据清洗', '意图分类'], deadline: '2026-08-23', createdAt: '08-15 11:20',
          delivery: { url: 'https://demo.local/delivery/t1004', note: '已完成全部数据清洗，抽检准确率 98.2%，交付包中附有质检报告。' },
          timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-15 11:20' }, { label: '林知夏接取订单', time: '08-15 13:42' }, { label: '接单方已提交交付物', time: '08-21 08:16' }]
        },
        {
          id: 't1005', ownerId: 'u3', assigneeId: 'u1', status: 'in_progress', category: '编程开发', budget: 3600, settlement: 'escrow',
          title: '开发 GPU 资源监控与用量计费接口', summary: '已接单，正在完成监控数据聚合和账单接口。',
          description: '提供 NVIDIA GPU 节点资源监控与按分钟计费 API，包含利用率、显存、温度和任务用量聚合。需提供 OpenAPI 文档与基础测试。',
          tags: ['Node.js', 'GPU', 'OpenAPI'], deadline: '2026-08-30', createdAt: '08-18 10:08', timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-18 10:08' }, { label: '陈默接取订单', time: '08-18 10:46' }]
        },
        {
          id: 't1006', ownerId: 'u1', assigneeId: 'u3', status: 'completed', category: '算力租用', budget: 900, settlement: 'direct',
          title: '租用 4×A100 80G 算力进行短期模型评测', summary: '订单已结算，资源使用记录和评测日志已归档。',
          description: '需要 4×A100 80G 连续 6 小时，用于开源大模型批量评测。要求 CUDA 12 环境、稳定外网与结果盘。',
          tags: ['A100', 'CUDA 12', '算力租用'], deadline: '2026-08-19', createdAt: '08-17 16:40', timeline: [{ label: '悬赏已发布', time: '08-17 16:40' }, { label: '周屿接取订单', time: '08-17 17:03' }, { label: '双方完成线下扫码结算', time: '08-19 20:18' }]
        },
        {
          id: 't1007', ownerId: 'u4', assigneeId: null, status: 'open', category: 'AI 设计', budget: 980, settlement: 'escrow',
          title: '生成 30 秒科技感产品发布短片', summary: '已有脚本、品牌素材和配音，需要完成 AI 视频制作与剪辑。',
          description: '按照分镜脚本制作 30 秒 16:9 产品短片。整体为克制的深色科技风，需要包含 5 个镜头、字幕动效和品牌片尾。交付 1080P 成片及无字幕版本。',
          tags: ['AI 视频', '剪辑', '1080P'], deadline: '2026-08-29', createdAt: '08-19 19:26', timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-19 19:26' }]
        },
        {
          id: 't1008', ownerId: 'u2', assigneeId: 'u1', status: 'completed', category: '其他服务', budget: 1500, settlement: 'escrow',
          title: '评审 AI 客服产品需求并输出技术方案', summary: '方案已验收并完成平台担保结算。',
          description: '评审现有 PRD，输出模型选型、知识库架构、风险项和两阶段排期建议。',
          tags: ['技术咨询', '产品方案', 'LLM'], deadline: '2026-08-12', createdAt: '08-08 09:10', timeline: [{ label: '悬赏已发布，资金已进入平台担保', time: '08-08 09:10' }, { label: '陈默接取订单', time: '08-08 11:35' }, { label: '发布方验收通过，担保资金已结算', time: '08-12 18:08' }]
        }
      ],
      messages: [
        { id: 'm1', taskId: 't1005', senderId: 'u3', text: '监控节点的接口文档已经放在订单说明里，计费按分钟向上取整。', time: '08-19 09:12' },
        { id: 'm2', taskId: 't1005', senderId: 'u1', text: '收到。我会先完成采集聚合层，明天发一版 OpenAPI 草稿给你确认。', time: '08-19 09:18' },
        { id: 'm3', taskId: 't1005', senderId: 'u3', text: '可以，请额外保留显存峰值字段。', time: '08-19 09:21' }
      ],
      transactions: [
        { id: 'x1', userId: 'u1', type: 'in', title: '订单收入 · AI 客服技术方案', amount: 1425, time: '08-12 18:08', channel: '平台担保' },
        { id: 'x2', userId: 'u1', type: 'out', title: '悬赏资金冻结 · 客服对话清洗', amount: -2800, time: '08-15 11:20', channel: '担保账户' },
        { id: 'x3', userId: 'u1', type: 'in', title: '余额充值', amount: 5000, time: '08-10 15:32', channel: '微信支付（演示）' },
        { id: 'x4', userId: 'u1', type: 'out', title: '提现至银行卡', amount: -2000, time: '08-06 10:15', channel: '尾号 0628（演示）' },
        { id: 'x5', userId: 'u2', type: 'in', title: '订单收入 · 图像分类标注', amount: 3240, time: '08-18 16:20', channel: '平台担保' },
        { id: 'x6', userId: 'u3', type: 'in', title: '扫码收款 · A100 算力租用', amount: 900, time: '08-19 20:18', channel: '付款码（演示）' }
      ],
      activity: [
        { id: 'a1', icon: 'check', title: '林知夏提交了订单交付物', text: '“清洗 12 万条中文客服对话并完成意图分类”已进入待验收状态。', time: '今天 08:16', taskId: 't1004' },
        { id: 'a2', icon: 'orders', title: '订单即将进入中期节点', text: '你接取的“GPU 资源监控与用量计费接口”距离截止还有 9 天。', time: '昨天 17:40', taskId: 't1005' },
        { id: 'a3', icon: 'wallet', title: '平台担保资金已结算', text: 'AI 客服技术方案订单验收通过，¥1,425.00 已进入余额。', time: '08-12 18:08', taskId: 't1008' },
        { id: 'a4', icon: 'shield', title: '账号完成实名认证', text: '你的实名状态已通过，现可使用发布悬赏、充值和提现功能。', time: '08-01 10:21' }
      ]
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === 2 && Array.isArray(saved.tasks)) return saved;
    } catch (_) { /* use fresh state */ }
    return seedState();
  }

  let state = loadState();
  let selectedLoginId = state.accounts[0].id;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function account(id) {
    return state.accounts.find(item => item.id === id);
  }

  function currentUser() {
    return account(state.sessionUserId) || state.accounts[0];
  }

  function avatarMarkup(user, extra = '') {
    return `<span class="avatar ${extra}" style="background:${escapeHtml(user.color)}">${escapeHtml(user.initials)}</span>`;
  }

  function renderLogin() {
    const layer = $('#loginLayer');
    if (state.sessionUserId) {
      layer.innerHTML = '';
      $('#app').hidden = false;
      return;
    }
    $('#app').hidden = true;
    layer.innerHTML = `
      <div class="login-box">
        <section class="login-intro">
          <button class="brand" type="button">
            <span class="brand-mark"><i></i><i></i><i></i></span>
            <span><strong>算力集</strong><small>COMPUTE HUB</small></span>
          </button>
          <h1>先看初版能力，<br><span>再确定谁来协作。</span></h1>
          <p>从作业辅导、代码讲解到 AI 开发和数据任务，先报名选人，再在订单内沟通、交付和验收。</p>
          <div class="login-points"><span><i>✓</i>初版报名与发布方选人</span><span><i>✓</i>订单内对话、修改和交付</span><span><i>✓</i>桌面、手机统一的完整流程</span></div>
        </section>
        <section class="login-form">
          <small>INTERACTIVE PROTOTYPE</small>
          <h2>选择演示身份</h2>
          <p>原型免密码登录。切换不同身份，可体验发布方与报名协作者的完整流程。</p>
          <div class="account-options">
            ${state.accounts.map(user => `<button class="account-option ${selectedLoginId === user.id ? 'selected' : ''}" data-login-account="${user.id}" type="button">${avatarMarkup(user)}<span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.role)}</small></span>${user.id === 'u1' ? '<b>推荐体验</b>' : ''}</button>`).join('')}
          </div>
          <button id="loginSubmit" class="primary-button login-submit" type="button">进入算力集 ${icon('chevron')}</button>
          <p class="demo-note">演示数据仅保存在当前浏览器，不会产生真实交易</p>
        </section>
      </div>`;
  }

  function renderHeader() {
    const user = currentUser();
    $('#sideProfile').innerHTML = `${avatarMarkup(user)}<span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.role)}</small></span>${icon('chevron')}`;
    $('#mobileAvatar').innerHTML = avatarMarkup(user);
    const attention = state.tasks.filter(task => (task.ownerId === user.id && (['submitted', 'pending_payment'].includes(task.status) || (task.status === 'open' && (task.applications || []).length))) || (task.assigneeId === user.id && task.status === 'in_progress')).length;
    $('#orderBadge').textContent = attention;
    $('#globalSearch').value = state.marketSearch || '';
  }

  function taskCard(task) {
    const owner = account(task.ownerId);
    const [label, className] = statusMap[task.status];
    const applicationCount = (task.applications || []).length;
    return `<article class="task-card" data-task-id="${task.id}" tabindex="0" role="button" aria-label="查看需求：${escapeHtml(task.title)}">
      <div class="task-card-head"><span class="tag">${escapeHtml(task.category)}</span><span class="status ${className}">${label}</span></div>
      <h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.summary)}</p>
      <div class="task-tags">${task.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      <div class="task-meta"><div class="task-owner">${avatarMarkup(owner)}<span><strong>${escapeHtml(owner.name)}</strong><small>信用 ${owner.rating} · ${owner.completed} 单</small></span></div><div class="task-price"><strong>${money(task.budget)}</strong><small>任务预算</small></div></div>
      <div class="settlement">${icon(task.status === 'open' ? 'user' : (task.settlement === 'escrow' ? 'shield' : 'scan'))}${task.status === 'open' ? `已有 ${applicationCount} 份初版报名` : (task.settlement === 'escrow' ? '平台担保 · 验收后结算' : '双方确认完成后结算')}</div>
    </article>`;
  }

  function renderMarket() {
    let tasks = [...state.tasks];
    if (state.marketCategory !== '全部') tasks = tasks.filter(task => task.category === state.marketCategory);
    const query = (state.marketSearch || '').trim().toLowerCase();
    if (query) tasks = tasks.filter(task => [task.title, task.summary, task.category, ...task.tags].join(' ').toLowerCase().includes(query));
    if (state.marketSort === 'budget') tasks.sort((a, b) => b.budget - a.budget);
    else if (state.marketSort === 'deadline') tasks.sort((a, b) => a.deadline.localeCompare(b.deadline));
    else tasks.sort((a, b) => (a.status === 'open' ? -1 : 1) - (b.status === 'open' ? -1 : 1));
    const openTasks = state.tasks.filter(task => task.status === 'open');
    const totalBudget = openTasks.reduce((sum, task) => sum + task.budget, 0);
    $('#marketView').innerHTML = `
      <section class="hero">
        <div class="hero-copy"><span class="eyebrow">STUDY & AI COLLABORATION</span><h1>先看初版，再选<span>合适的人</span>协作</h1><p>主要服务作业辅导、代码讲解与共同完成，也支持开发、数据、AI 创作和算力等其他真实需求。</p><div class="hero-actions"><button class="primary-button" data-action="publish">${icon('plus')}发布辅导需求</button><button class="text-link" data-nav="workspace">查看报名与订单${icon('chevron')}</button></div></div>
        <div class="compute-art" aria-hidden="true"><span class="orbit o1"></span><span class="orbit o2"></span><span class="compute-core"></span><i class="node n1"></i><i class="node n2"></i><i class="node n3"></i></div>
      </section>
      <div class="market-stats">
        <div class="market-stat"><span>${icon('orders')}</span><span><strong>${openTasks.length}</strong><small>当前开放需求</small></span></div>
        <div class="market-stat"><span>${icon('user')}</span><span><strong>${openTasks.reduce((sum, task) => sum + (task.applications || []).length, 0)}</strong><small>已提交初版报名</small></span></div>
        <div class="market-stat"><span>${icon('wallet')}</span><span><strong>${money(totalBudget)}</strong><small>公开需求预算</small></span></div>
        <div class="market-stat"><span>${icon('check')}</span><span><strong>${state.accounts.reduce((sum, u) => sum + u.completed, 0)}+</strong><small>已完成协作</small></span></div>
      </div>
      <div class="section-heading"><div><h2>发现合适的协作需求</h2><p>先提交思路、示例或计划，由发布方比较后选人</p></div></div>
      <div class="category-row">${categories.map(item => `<button class="category-chip ${state.marketCategory === item ? 'active' : ''}" data-category="${item}">${item}</button>`).join('')}</div>
      <div class="filter-row"><select id="statusFilter" aria-label="订单状态"><option>全部状态</option><option>仅看可报名</option></select><select id="sortSelect" aria-label="排序方式"><option value="recommend" ${state.marketSort === 'recommend' ? 'selected' : ''}>推荐排序</option><option value="budget" ${state.marketSort === 'budget' ? 'selected' : ''}>预算从高到低</option><option value="deadline" ${state.marketSort === 'deadline' ? 'selected' : ''}>截止时间优先</option></select><span class="result-count">找到 ${tasks.length} 个需求</span></div>
      ${tasks.length ? `<div class="task-grid">${tasks.map(taskCard).join('')}</div>` : `<div class="empty-state"><span>${icon('search')}</span><h3>没有匹配的需求</h3><p>试试其他关键词或分类，也可以发布一个新需求。</p></div>`}`;
  }

  function progressFor(status) {
    return ({ open: 12, in_progress: 55, submitted: 84, pending_payment: 92, completed: 100 })[status] || 0;
  }

  function orderRow(task) {
    let [label, className] = statusMap[task.status];
    const myApplication = (task.applications || []).find(item => item.applicantId === currentUser().id);
    if (myApplication && task.assigneeId !== currentUser().id) {
      label = task.status === 'open' ? '报名审核中' : '未入选';
      className = task.status === 'open' ? 'submitted' : 'completed';
    }
    const counterpart = account(task.ownerId === currentUser().id ? task.assigneeId : task.ownerId);
    return `<article class="order-row" data-task-id="${task.id}" role="button" tabindex="0">
      <div><span class="status ${className}">${label}</span><h3>${escapeHtml(task.title)}</h3><p>${counterpart ? `${task.ownerId === currentUser().id ? '协作者' : '发布方'}：${escapeHtml(counterpart.name)}` : `已收到 ${(task.applications || []).length} 份初版报名`} · 截止 ${escapeHtml(task.deadline)}</p></div>
      <div class="order-progress"><p><span>订单进度</span><span>${progressFor(task.status)}%</span></p><div class="progress-track"><span style="width:${progressFor(task.status)}%"></span></div></div>
      <div class="order-amount"><strong>${money(task.budget)}</strong><small>${task.status === 'open' ? `${(task.applications || []).length} 份报名` : (task.settlement === 'escrow' ? '原担保演示' : '协商结算')}</small></div>
    </article>`;
  }

  function renderWorkspace() {
    const user = currentUser();
    const created = state.tasks.filter(task => task.ownerId === user.id);
    const accepted = state.tasks.filter(task => task.assigneeId === user.id || (task.applications || []).some(item => item.applicantId === user.id));
    const shown = state.workspaceTab === 'created' ? created : accepted;
    const activeCount = [...created, ...accepted].filter((task, index, all) => all.findIndex(item => item.id === task.id) === index && ['in_progress', 'submitted', 'pending_payment'].includes(task.status)).length;
    const pendingCount = created.filter(task => ['submitted', 'pending_payment'].includes(task.status) || (task.status === 'open' && (task.applications || []).length)).length;
    $('#workspaceView').innerHTML = `
      <div class="page-title"><div><h1>我的订单</h1><p>追踪发布、报名、选人、沟通、交付与验收。</p></div><button class="primary-button" data-action="publish">${icon('plus')}发布需求</button></div>
      <div class="metric-grid"><div class="metric-card"><small>我发布的</small><strong>${created.length}</strong><em>累计需求</em></div><div class="metric-card"><small>我参与的</small><strong>${accepted.length}</strong><em>协作记录</em></div><div class="metric-card"><small>进行中的</small><strong>${activeCount}</strong><em>需要持续跟进</em></div><div class="metric-card"><small>待我处理</small><strong>${pendingCount}</strong><em>${pendingCount ? '请及时处理' : '暂无待办'}</em></div></div>
      <div class="segmented"><button class="${state.workspaceTab === 'created' ? 'active' : ''}" data-workspace-tab="created">我发布的 · ${created.length}</button><button class="${state.workspaceTab === 'accepted' ? 'active' : ''}" data-workspace-tab="accepted">我参与的 · ${accepted.length}</button></div>
      ${shown.length ? `<div class="order-list">${shown.map(orderRow).join('')}</div>` : `<div class="empty-state"><span>${icon('orders')}</span><h3>${state.workspaceTab === 'created' ? '还没有发布需求' : '还没有入选订单'}</h3><p>${state.workspaceTab === 'created' ? '发布第一条协作需求，等待合适的人提交初版报名。' : '去协作广场提交一份有内容的初版报名。'}</p></div>`}`;
  }

  function transactionMarkup(item) {
    return `<div class="transaction ${item.type}"><span class="transaction-icon">${icon(item.type === 'in' ? 'arrow-down' : 'arrow-up')}</span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.time)} · ${escapeHtml(item.channel)}</small></span><b>${item.amount > 0 ? '+' : ''}${money(item.amount)}</b></div>`;
  }

  function renderWallet() {
    const user = currentUser();
    const transactions = state.transactions.filter(item => item.userId === user.id);
    $('#walletView').innerHTML = `
      <div class="page-title"><div><h1>结算与资金演示</h1><p>当前只验证结算交互；充值、提现和担保均未接入真实支付。</p></div></div>
      <section class="wallet-hero"><div><span class="balance-label">可用余额</span><div class="balance-amount"><small>¥</small>${Number(user.balance).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</div><div class="wallet-badges"><span>担保中<strong>${money(user.frozen)}</strong></span><span>累计收入<strong>${money(user.income)}</strong></span></div></div><div class="wallet-actions"><button data-wallet-action="recharge">${icon('arrow-down')}充值</button><button data-wallet-action="withdraw">${icon('arrow-up')}提现</button><button data-wallet-action="receive">${icon('scan')}收款码</button></div></section>
      <div class="wallet-content"><section class="panel"><div class="panel-head"><h2>最近结算记录</h2><button>全部记录</button></div>${transactions.length ? `<div class="transaction-list">${transactions.map(transactionMarkup).join('')}</div>` : '<div class="empty-state"><p>暂无交易记录</p></div>'}</section><aside class="panel"><h2>当前产品阶段</h2><div class="trust-list"><div class="trust-item"><span>${icon('activity')}</span><div><strong>先跑通协作</strong><p>报名、选人、沟通、交付与验收是当前验证重点。</p></div></div><div class="trust-item"><span>${icon('check')}</span><div><strong>订单留痕</strong><p>关键节点和双方对话保存在同一订单内。</p></div></div><div class="trust-item"><span>${icon('shield')}</span><div><strong>支付后续接入</strong><p>持牌支付服务与合规方案确认后，再开放真实担保。</p></div></div></div></aside></div>`;
  }

  function renderActivity() {
    const user = currentUser();
    $('#activityView').innerHTML = `
      <div class="page-title"><div><h1>协作动态</h1><p>订单进度、交付和资金状态集中查看。</p></div></div>
      <div class="activity-layout"><section class="panel"><div class="panel-head"><h2>最新动态</h2><button id="markRead">全部已读</button></div><div class="timeline">${state.activity.map(item => `<article class="activity-item" ${item.taskId ? `data-task-id="${item.taskId}" role="button" tabindex="0"` : ''}><span class="activity-icon">${icon(item.icon)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><time>${escapeHtml(item.time)}</time></div></article>`).join('')}</div></section><aside class="panel profile-card">${avatarMarkup(user)}<h2>${escapeHtml(user.name)}</h2><p>${escapeHtml(user.role)} · ${user.verified ? '已实名认证' : '未认证'}</p><div class="rating-row"><span><strong>${user.rating}</strong><small>信用评分</small></span><span><strong>${user.completed}</strong><small>完成订单</small></span><span><strong>${user.skills.length}</strong><small>能力标签</small></span></div><button class="ghost-button" data-action="profile">切换演示身份</button></aside></div>`;
  }

  function renderAll() {
    if (!state.sessionUserId) return renderLogin();
    renderLogin();
    renderHeader();
    renderMarket();
    renderWorkspace();
    renderWallet();
    renderActivity();
    navigate(state.currentView || 'market', false);
  }

  function navigate(view, shouldScroll = true) {
    const allowed = ['market', 'workspace', 'wallet', 'activity'];
    if (!allowed.includes(view)) view = 'market';
    state.currentView = view;
    $$('.view').forEach(section => section.classList.toggle('active-view', section.id === `${view}View`));
    $$('[data-nav]').forEach(button => button.classList.toggle('active', button.dataset.nav === view));
    if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    saveState();
  }

  function openModal({ title, subtitle = '', body, footer = '', size = '' }) {
    $('#modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal ${size}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><header class="modal-head"><div><h2>${escapeHtml(title)}</h2>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</div><button class="modal-close" data-close-modal aria-label="关闭">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ''}</section></div>`;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $('#modalRoot').innerHTML = '';
    document.body.style.overflow = '';
  }

  function toast(message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = `<span>${icon('check')}</span><div>${escapeHtml(message)}</div>`;
    $('#toastRoot').appendChild(node);
    setTimeout(() => node.classList.add('out'), 2700);
    setTimeout(() => node.remove(), 3050);
  }

  function openPublish() {
    const user = currentUser();
    const minDate = new Date().toISOString().slice(0, 10);
    openModal({
      title: '发布协作需求', subtitle: '候选人先提交初版思路或示例，你比较后再选定协作者', size: 'wide',
      body: `<form id="publishForm" class="form-grid">
        <div class="form-field full"><label for="taskTitle">需求标题 <span class="required">*</span></label><input id="taskTitle" name="title" required maxlength="50" placeholder="例如：Python 数据分析作业辅导与代码讲解"></div>
        <div class="form-field"><label for="taskCategory">服务分类 <span class="required">*</span></label><select id="taskCategory" name="category" required>${categories.slice(1).map(item => `<option>${item}</option>`).join('')}</select></div>
        <div class="form-field"><label for="taskBudget">参考预算 <span class="required">*</span></label><div class="money-input"><span>¥</span><input id="taskBudget" name="budget" type="number" min="10" step="1" required placeholder="500"></div></div>
        <div class="form-field"><label for="taskDeadline">期望截止日 <span class="required">*</span></label><input id="taskDeadline" name="deadline" type="date" min="${minDate}" required></div>
        <div class="form-field"><label for="taskTags">技能标签</label><input id="taskTags" name="tags" placeholder="RAG, Python, 数据清洗"><small>使用逗号分隔，最多 4 个</small></div>
        <div class="form-field full"><label for="taskDescription">需求与完成标准 <span class="required">*</span></label><textarea id="taskDescription" name="description" required minlength="12" placeholder="说明题目或任务、已完成进度、希望对方先展示什么初版、最终需要讲解或交付什么……"></textarea></div>
        <div class="form-field full"><label>结算方式</label><div class="settlement-options"><div class="settlement-option"><input id="settleDirect" type="radio" name="settlement" value="direct" checked><label for="settleDirect"><span>${icon('scan')}</span><span><strong>完成后双方确认</strong><small>本阶段使用演示付款码，平台只记录结算结果</small></span></label></div><div class="settlement-option"><input id="settleEscrow" type="radio" name="settlement" value="escrow" disabled><label for="settleEscrow" style="opacity:.55;cursor:not-allowed"><span>${icon('shield')}</span><span><strong>平台担保 · 后续接入</strong><small>支付合规与服务商方案确认后再开放</small></span></label></div></div></div>
        <div class="form-field full"><div class="form-hint">${icon('shield')}作业类需求应以辅导、讲解、共同完成和批改为主；不支持代考、冒名提交、论文代写或绕过学校规则的服务。</div></div>
      </form>`,
      footer: `<button class="ghost-button" data-close-modal>取消</button><button class="primary-button" type="submit" form="publishForm">确认发布</button>`
    });
  }

  function submitPublish(form) {
    const data = new FormData(form);
    const user = currentUser();
    const budget = Number(data.get('budget'));
    const settlement = data.get('settlement') || 'direct';
    if (settlement === 'escrow' && user.balance < budget) {
      toast(`可用余额不足，还差 ${money(budget - user.balance)}`);
      return;
    }
    const id = `t${Date.now()}`;
    const description = String(data.get('description')).trim();
    const tags = String(data.get('tags') || '').split(/[,，]/).map(item => item.trim()).filter(Boolean).slice(0, 4);
    const task = {
      id, ownerId: user.id, assigneeId: null, status: 'open', category: data.get('category'), budget, settlement,
      title: String(data.get('title')).trim(), summary: description.slice(0, 54) + (description.length > 54 ? '…' : ''), description,
      tags: tags.length ? tags : [data.get('category')], deadline: data.get('deadline'), createdAt: todayText(), applications: [],
      timeline: [{ label: settlement === 'escrow' ? '需求已发布，资金已进入平台担保' : '需求已发布，等待初版报名', time: todayText() }]
    };
    if (settlement === 'escrow') {
      user.balance -= budget;
      user.frozen += budget;
      state.transactions.unshift({ id: `x${Date.now()}`, userId: user.id, type: 'out', title: `悬赏资金冻结 · ${task.title}`, amount: -budget, time: todayText(), channel: '担保账户' });
    }
    state.tasks.unshift(task);
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'orders', title: '你发布了新的协作需求', text: task.title, time: '刚刚', taskId: id });
    state.workspaceTab = 'created';
    state.currentView = 'workspace';
    saveState(); closeModal(); renderAll(); toast('需求发布成功，已开放初版报名');
  }

  function detailFooter(task) {
    const uid = currentUser().id;
    const buttons = ['<button class="ghost-button" data-close-modal>关闭</button>'];
    const ownApplication = (task.applications || []).find(item => item.applicantId === uid);
    if (task.status === 'open' && task.ownerId === uid) buttons.push(`<button class="primary-button" data-task-action="applications" data-id="${task.id}">${icon('user')}查看报名 (${(task.applications || []).length})</button>`);
    if (task.status === 'open' && task.ownerId !== uid) buttons.push(`<button class="primary-button" data-task-action="apply" data-id="${task.id}">${ownApplication ? '修改我的初版报名' : '提交初版报名'}</button>`);
    if (task.status !== 'open' && [task.ownerId, task.assigneeId].includes(uid)) buttons.push(`<button class="secondary-button" data-task-action="chat" data-id="${task.id}">${icon('activity')}订单沟通</button>`);
    if (task.status === 'in_progress' && task.assigneeId === uid) buttons.push(`<button class="primary-button" data-task-action="deliver" data-id="${task.id}">提交交付物</button>`);
    if (task.status === 'submitted' && task.ownerId === uid) {
      buttons.push(`<button class="secondary-button" data-task-action="revise" data-id="${task.id}">要求修改</button>`);
      buttons.push(`<button class="primary-button" data-task-action="approve" data-id="${task.id}">验收通过</button>`);
    }
    if (task.status === 'pending_payment' && task.ownerId === uid) buttons.push(`<button class="primary-button" data-task-action="pay" data-id="${task.id}">${icon('scan')}扫码付款</button>`);
    return buttons.join('');
  }

  function openTaskDetail(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task) return;
    const owner = account(task.ownerId);
    const assignee = account(task.assigneeId);
    const [label, className] = statusMap[task.status];
    const applications = task.applications || [];
    const ownApplication = applications.find(item => item.applicantId === currentUser().id);
    const delivery = task.delivery ? `<div class="detail-section"><h3>已提交的交付物</h3><div class="form-hint">${icon('check')}<div><strong>${escapeHtml(task.delivery.url || '未提供链接')}</strong><br>${escapeHtml(task.delivery.note)}</div></div></div>` : '';
    const applicationSummary = task.status === 'open'
      ? `<div class="application-summary"><span>${icon('user')}</span><div><strong>${applications.length ? `已收到 ${applications.length} 份初版报名` : '等待第一份初版报名'}</strong><p>${task.ownerId === currentUser().id ? '比较候选人的思路、示例、报价和时间，再确定合作人。' : (ownApplication ? `你的报名已提交 · 报价 ${money(ownApplication.quote)} · 预计 ${ownApplication.days} 天` : '提交初步思路或小样，不需要在入选前完成全部任务。')}</p></div></div>`
      : (ownApplication && task.assigneeId !== currentUser().id ? `<div class="application-summary"><span>${icon('user')}</span><div><strong>本次报名未入选</strong><p>发布方已选择其他协作者，你的初版报名仍保留在个人记录中。</p></div></div>` : '');
    openModal({
      title: '需求详情', subtitle: `订单号 ${task.id.toUpperCase()}`, size: 'wide',
      body: `<div class="detail-top"><div><span class="tag">${escapeHtml(task.category)}</span><h2>${escapeHtml(task.title)}</h2><p><span class="status ${className}">${label}</span></p></div><div class="detail-budget"><strong>${money(task.budget)}</strong><small>${task.originalBudget ? `原预算 ${money(task.originalBudget)}` : '公开需求预算'}</small></div></div>
        <div class="detail-facts"><div class="detail-fact"><small>截止日期</small><strong>${escapeHtml(task.deadline)}</strong></div><div class="detail-fact"><small>结算方式</small><strong>${task.settlement === 'escrow' ? '原担保演示订单' : '完成后双方确认'}</strong></div><div class="detail-fact"><small>合作方</small><strong>${assignee ? escapeHtml(assignee.name) : '发布方尚未选人'}</strong></div></div>
        ${applicationSummary}<div class="detail-section"><h3>需求与完成标准</h3><p>${escapeHtml(task.description)}</p></div><div class="detail-tags">${task.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        ${delivery}
        <div class="owner-strip">${avatarMarkup(owner)}<span><strong>${escapeHtml(owner.name)} · 发布方</strong><small>${escapeHtml(owner.role)} · 已完成 ${owner.completed} 单</small></span><b>★ ${owner.rating}</b></div>
        <div class="detail-section"><h3>订单进度</h3><div class="timeline-mini">${task.timeline.map(item => `<div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.time)}</small></div>`).join('')}</div></div>`,
      footer: detailFooter(task)
    });
  }

  function openApplicationForm(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task || task.status !== 'open' || task.ownerId === currentUser().id) return;
    const existing = (task.applications || []).find(item => item.applicantId === currentUser().id);
    openModal({ title: existing ? '修改初版报名' : '提交初版报名', subtitle: task.title, size: 'wide', body: `<form id="applicationForm" class="form-grid" data-id="${task.id}"><div class="form-field full"><label for="proposal">初步思路与完成计划 <span class="required">*</span></label><textarea id="proposal" name="proposal" required minlength="12" placeholder="说明你准备怎么做、关键步骤是什么、如何让发布方确认你理解了需求……">${escapeHtml(existing?.proposal || '')}</textarea></div><div class="form-field full"><label for="sample">初版内容、示例或小样 <span class="required">*</span></label><textarea id="sample" name="sample" required minlength="8" placeholder="可以给出一小段解题思路、代码框架、设计草图说明或类似项目示例。无需提前完成全部任务。">${escapeHtml(existing?.sample || '')}</textarea></div><div class="form-field"><label for="applicationQuote">我的报价 <span class="required">*</span></label><div class="money-input"><span>¥</span><input id="applicationQuote" name="quote" type="number" min="1" step="1" required value="${existing?.quote || task.budget}"></div></div><div class="form-field"><label for="applicationDays">预计用时（天） <span class="required">*</span></label><input id="applicationDays" name="days" type="number" min="1" max="90" required value="${existing?.days || 3}"></div><div class="form-field full"><div class="form-hint">${icon('user')}初版用于展示理解和能力。入选后会开启订单对话，再共同确认细节与完成版本。</div></div></form>`, footer: `<button class="ghost-button" data-close-modal>取消</button><button class="primary-button" type="submit" form="applicationForm">${existing ? '保存修改' : '提交报名'}</button>` });
  }

  function submitApplication(form) {
    const task = state.tasks.find(item => item.id === form.dataset.id);
    if (!task || task.status !== 'open' || task.ownerId === currentUser().id) return;
    const data = new FormData(form);
    task.applications ||= [];
    let application = task.applications.find(item => item.applicantId === currentUser().id);
    const isNew = !application;
    if (!application) {
      application = { id: `ap${Date.now()}`, applicantId: currentUser().id, status: 'pending', createdAt: todayText() };
      task.applications.push(application);
    }
    application.proposal = String(data.get('proposal')).trim();
    application.sample = String(data.get('sample')).trim();
    application.quote = Number(data.get('quote'));
    application.days = Number(data.get('days'));
    application.updatedAt = todayText();
    if (isNew) task.timeline.push({ label: `${currentUser().name}提交了初版报名`, time: todayText() });
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'user', title: isNew ? '初版报名已提交' : '初版报名已更新', text: task.title, time: '刚刚', taskId: task.id });
    saveState(); closeModal(); renderAll(); toast(isNew ? '报名已提交，等待发布方比较选择' : '初版报名已更新');
  }

  function openApplications(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task || task.ownerId !== currentUser().id || task.status !== 'open') return;
    const applications = task.applications || [];
    const body = applications.length ? `<div class="application-list">${applications.map(item => { const candidate = account(item.applicantId); return `<article class="application-card"><div class="application-person">${avatarMarkup(candidate)}<span><strong>${escapeHtml(candidate.name)}</strong><small>${escapeHtml(candidate.role)} · 信用 ${candidate.rating} · ${candidate.completed} 单</small></span><div><b>${money(item.quote)}</b><small>${item.days} 天</small></div></div><div class="application-block"><small>初步思路</small><p>${escapeHtml(item.proposal)}</p></div><div class="application-block sample"><small>初版内容 / 示例</small><p>${escapeHtml(item.sample)}</p></div><button class="primary-button" data-select-application="${item.id}" data-task="${task.id}">选定 ${escapeHtml(candidate.name)} 开始协作</button></article>`; }).join('')}</div>` : `<div class="empty-state"><span>${icon('user')}</span><h3>暂时还没有报名</h3><p>报名到达后会在这里展示初版思路、报价和预计时间。</p></div>`;
    openModal({ title: `比较初版报名 · ${applications.length} 份`, subtitle: task.title, size: 'wide', body, footer: '<button class="ghost-button" data-close-modal>关闭</button>' });
  }

  function selectApplication(taskId, applicationId) {
    const task = state.tasks.find(item => item.id === taskId);
    const application = task && (task.applications || []).find(item => item.id === applicationId);
    if (!task || !application || task.ownerId !== currentUser().id || task.status !== 'open') return;
    task.applications.forEach(item => { item.status = item.id === applicationId ? 'selected' : 'not_selected'; });
    task.assigneeId = application.applicantId;
    task.status = 'in_progress';
    task.selectedApplicationId = application.id;
    task.originalBudget = task.budget;
    task.budget = application.quote;
    const candidate = account(application.applicantId);
    task.timeline.push({ label: `发布方选定 ${candidate.name}，订单开始进行`, time: todayText() });
    state.messages ||= [];
    state.messages.push({ id: `m${Date.now()}`, taskId: task.id, senderId: null, text: `发布方已从 ${task.applications.length} 份报名中选定 ${candidate.name}，订单沟通已开启。`, time: todayText() });
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'orders', title: '已选定协作者，订单开始进行', text: `${task.title} · ${candidate.name}`, time: '刚刚', taskId: task.id });
    state.workspaceTab = 'created';
    saveState(); closeModal(); renderAll(); openTaskDetail(task.id); toast(`已选定 ${candidate.name}，现在可以在订单内沟通`);
  }

  function openChat(id) {
    const task = state.tasks.find(item => item.id === id);
    const uid = currentUser().id;
    if (!task || ![task.ownerId, task.assigneeId].includes(uid) || task.status === 'open') return;
    const other = account(task.ownerId === uid ? task.assigneeId : task.ownerId);
    const messages = (state.messages || []).filter(item => item.taskId === task.id);
    const thread = messages.length ? messages.map(item => {
      if (!item.senderId) return `<div class="message-system"><span>${escapeHtml(item.text)}</span><small>${escapeHtml(item.time)}</small></div>`;
      const sender = account(item.senderId);
      const own = item.senderId === uid;
      return `<article class="chat-message ${own ? 'own' : ''}">${!own ? avatarMarkup(sender) : ''}<div><small>${own ? '我' : escapeHtml(sender.name)} · ${escapeHtml(item.time)}</small><p>${escapeHtml(item.text)}</p></div></article>`;
    }).join('') : `<div class="chat-empty">${icon('activity')}<p>订单沟通已开启，现在可以确认题目、时间、修改和交付细节。</p></div>`;
    openModal({ title: `与 ${other ? other.name : '合作方'} 沟通`, subtitle: task.title, size: 'wide', body: `<div id="chatThread" class="chat-thread">${thread}</div><form id="chatForm" class="chat-compose" data-id="${task.id}"><input id="chatInput" name="message" required maxlength="500" autocomplete="off" placeholder="输入订单相关消息……"><button class="primary-button" type="submit">发送</button></form><div class="chat-notice">请只在订单内确认需求和交付；不要发送密码、证件或其他敏感信息。</div>` });
    requestAnimationFrame(() => { const threadNode = $('#chatThread'); if (threadNode) threadNode.scrollTop = threadNode.scrollHeight; $('#chatInput')?.focus(); });
  }

  function submitChat(form) {
    const task = state.tasks.find(item => item.id === form.dataset.id);
    const text = String(new FormData(form).get('message') || '').trim();
    if (!task || !text || ![task.ownerId, task.assigneeId].includes(currentUser().id)) return;
    state.messages ||= [];
    state.messages.push({ id: `m${Date.now()}`, taskId: task.id, senderId: currentUser().id, text, time: todayText() });
    saveState();
    openChat(task.id);
  }

  function openDelivery(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task) return;
    openModal({ title: '提交交付物', subtitle: task.title, body: `<form id="deliveryForm" class="form-grid" data-id="${task.id}"><div class="form-field full"><label for="deliveryUrl">交付链接</label><input id="deliveryUrl" name="url" type="url" placeholder="https://...（原型可留空）"></div><div class="form-field full"><label for="deliveryNote">交付说明 <span class="required">*</span></label><textarea id="deliveryNote" name="note" required minlength="6" placeholder="说明完成内容、文件结构、运行方法和需要对方重点验收的部分。"></textarea></div><div class="form-field full"><div class="form-hint">${icon('check')}提交后订单将进入“待验收”。发布方可以验收通过，也可以退回修改。</div></div></form>`, footer: `<button class="ghost-button" data-close-modal>取消</button><button class="primary-button" type="submit" form="deliveryForm">确认提交</button>` });
  }

  function submitDelivery(form) {
    const task = state.tasks.find(item => item.id === form.dataset.id);
    if (!task || task.assigneeId !== currentUser().id) return;
    const data = new FormData(form);
    task.delivery = { url: String(data.get('url') || '').trim() || '本地交付包（演示）', note: String(data.get('note')).trim() };
    task.status = 'submitted';
    task.timeline.push({ label: '接单方已提交交付物', time: todayText() });
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'check', title: '交付物已提交，等待验收', text: task.title, time: '刚刚', taskId: task.id });
    saveState(); closeModal(); renderAll(); toast('交付成功，已通知发布方验收');
  }

  function reviseTask(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task || task.ownerId !== currentUser().id || task.status !== 'submitted') return;
    task.status = 'in_progress';
    task.timeline.push({ label: '发布方要求修改交付内容', time: todayText() });
    saveState(); closeModal(); renderAll(); toast('已退回修改，接单方可重新提交');
  }

  function approveTask(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task || task.ownerId !== currentUser().id || task.status !== 'submitted') return;
    if (task.settlement === 'direct') {
      task.status = 'pending_payment';
      task.timeline.push({ label: '交付已验收，等待扫码付款', time: todayText() });
      saveState(); renderAll(); openTaskDetail(task.id); toast('验收通过，请完成扫码付款');
      return;
    }
    const owner = account(task.ownerId);
    const provider = account(task.assigneeId);
    const payout = Math.round(task.budget * 0.95 * 100) / 100;
    owner.frozen = Math.max(0, owner.frozen - task.budget);
    provider.balance += payout;
    provider.income += payout;
    provider.completed += 1;
    task.status = 'completed';
    task.platformFee = task.budget - payout;
    task.timeline.push({ label: `发布方验收通过，${money(payout)} 已结算`, time: todayText() });
    state.transactions.unshift({ id: `x${Date.now()}`, userId: provider.id, type: 'in', title: `订单收入 · ${task.title}`, amount: payout, time: todayText(), channel: '平台担保' });
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'wallet', title: '订单验收并完成担保结算', text: `${task.title} · 接单方实收 ${money(payout)}`, time: '刚刚', taskId: id });
    saveState(); closeModal(); renderAll(); toast(`验收完成，已向接单方结算 ${money(payout)}`);
  }

  function openPayment(id) {
    const task = state.tasks.find(item => item.id === id);
    const provider = task && account(task.assigneeId);
    if (!task || !provider) return;
    openModal({ title: '扫码完成订单付款', subtitle: `收款方：${provider.name} · 原型不会发起真实支付`, size: 'small', body: `<div class="qr-wrap"><canvas id="paymentQr" width="210" height="210"></canvas><h3>向 ${escapeHtml(provider.name)} 付款</h3><div class="qr-amount">${money(task.budget)}</div><p>请使用微信或支付宝扫描（演示二维码）</p></div>`, footer: `<button class="ghost-button" data-close-modal>稍后支付</button><button class="primary-button" data-confirm-payment="${task.id}">模拟已付款</button>` });
    requestAnimationFrame(() => drawQr($('#paymentQr'), `COMPUTEHUB:${task.id}:${task.budget}:${provider.id}`));
  }

  function completeDirectPayment(id) {
    const task = state.tasks.find(item => item.id === id);
    const provider = task && account(task.assigneeId);
    if (!task || task.status !== 'pending_payment') return;
    task.status = 'completed';
    provider.income += task.budget;
    provider.completed += 1;
    task.timeline.push({ label: '双方完成付款码结算，订单结束', time: todayText() });
    state.transactions.unshift({ id: `x${Date.now()}`, userId: provider.id, type: 'in', title: `扫码收款 · ${task.title}`, amount: task.budget, time: todayText(), channel: '付款码（演示）' });
    state.activity.unshift({ id: `a${Date.now()}`, icon: 'wallet', title: '付款码结算完成', text: `${task.title} · ${money(task.budget)}`, time: '刚刚', taskId: id });
    saveState(); closeModal(); renderAll(); toast('付款状态已确认，订单圆满完成');
  }

  function drawQr(canvas, seedText) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const modules = 29, cell = canvas.width / modules;
    let seed = [...seedText].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
    const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    const matrix = Array.from({ length: modules }, () => Array.from({ length: modules }, () => random() > .52));
    const finder = (x, y) => {
      for (let dy = 0; dy < 7; dy++) for (let dx = 0; dx < 7; dx++) matrix[y + dy][x + dx] = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    };
    finder(1, 1); finder(modules - 8, 1); finder(1, modules - 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#17152f';
    matrix.forEach((row, y) => row.forEach((on, x) => { if (on) ctx.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell)); }));
  }

  function openWalletAction(action) {
    const user = currentUser();
    if (action === 'receive') {
      openModal({ title: '我的收款码', subtitle: '可填写金额后向合作方展示付款码', size: 'small', body: `<div class="form-field"><label for="receiveAmount">收款金额</label><div class="money-input"><span>¥</span><input id="receiveAmount" type="number" min="0" step="1" value="500"></div></div><div class="qr-wrap" style="margin-top:18px"><canvas id="receiveQr" width="210" height="210"></canvas><p>演示二维码 · 不会产生真实支付</p></div>`, footer: `<button class="primary-button" data-close-modal>完成</button>` });
      const redraw = () => drawQr($('#receiveQr'), `RECEIVE:${user.id}:${$('#receiveAmount')?.value || 0}`);
      requestAnimationFrame(redraw);
      setTimeout(() => $('#receiveAmount')?.addEventListener('input', redraw), 0);
      return;
    }
    const isRecharge = action === 'recharge';
    openModal({ title: isRecharge ? '余额充值' : '余额提现', subtitle: isRecharge ? '演示充值会立即计入本地余额' : `当前可提现 ${money(user.balance)}`, size: 'small', body: `<form id="moneyForm" data-type="${action}" class="form-grid"><div class="form-field full"><label for="moneyAmount">${isRecharge ? '充值' : '提现'}金额 <span class="required">*</span></label><div class="money-input"><span>¥</span><input id="moneyAmount" name="amount" type="number" min="1" step="1" required placeholder="1000"></div></div><div class="form-field full"><label for="moneyChannel">${isRecharge ? '支付方式' : '到账账户'}</label><select id="moneyChannel" name="channel">${isRecharge ? '<option>微信支付（演示）</option><option>支付宝（演示）</option><option>银行卡（演示）</option>' : '<option>银行卡尾号 0628（演示）</option><option>支付宝账户（演示）</option>'}</select></div><div class="form-field full"><div class="form-hint">${icon('shield')}这是产品交互原型，不会请求银行卡、密码或产生真实资金流转。</div></div></form>`, footer: `<button class="ghost-button" data-close-modal>取消</button><button class="primary-button" type="submit" form="moneyForm">确认${isRecharge ? '充值' : '提现'}</button>` });
  }

  function submitMoney(form) {
    const data = new FormData(form); const amount = Number(data.get('amount')); const type = form.dataset.type; const user = currentUser();
    if (type === 'withdraw' && amount > user.balance) { toast('提现金额不能超过可用余额'); return; }
    const isIn = type === 'recharge';
    user.balance += isIn ? amount : -amount;
    state.transactions.unshift({ id: `x${Date.now()}`, userId: user.id, type: isIn ? 'in' : 'out', title: isIn ? '余额充值' : '提现至账户', amount: isIn ? amount : -amount, time: todayText(), channel: data.get('channel') });
    saveState(); closeModal(); renderAll(); toast(`${isIn ? '充值' : '提现'}演示成功：${money(amount)}`);
  }

  function openProfile() {
    const user = currentUser();
    openModal({ title: '账号与演示身份', subtitle: '切换身份可从另一方视角继续同一笔订单', body: `<div class="account-options">${state.accounts.map(item => `<button class="account-option ${item.id === user.id ? 'selected' : ''}" data-switch-account="${item.id}" type="button">${avatarMarkup(item)}<span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.role)} · 余额 ${money(item.balance)}</small></span>${item.id === user.id ? '<b>当前身份</b>' : ''}</button>`).join('')}</div>`, footer: `<button class="danger-button" data-reset-demo>重置演示数据</button><button class="ghost-button" data-logout>${icon('logout')}退出登录</button><button class="primary-button" data-close-modal>完成</button>` });
  }

  function switchAccount(id) {
    if (!account(id)) return;
    state.sessionUserId = id;
    saveState(); closeModal(); renderAll(); toast(`已切换为 ${currentUser().name}`);
  }

  document.addEventListener('click', event => {
    const loginAccount = event.target.closest('[data-login-account]');
    if (loginAccount) { selectedLoginId = loginAccount.dataset.loginAccount; renderLogin(); return; }
    if (event.target.closest('#loginSubmit')) { state.sessionUserId = selectedLoginId; saveState(); renderAll(); toast(`欢迎回来，${currentUser().name}`); return; }
    const nav = event.target.closest('[data-nav]');
    if (nav) { navigate(nav.dataset.nav); return; }
    const category = event.target.closest('[data-category]');
    if (category) { state.marketCategory = category.dataset.category; saveState(); renderMarket(); return; }
    const workspaceTab = event.target.closest('[data-workspace-tab]');
    if (workspaceTab) { state.workspaceTab = workspaceTab.dataset.workspaceTab; saveState(); renderWorkspace(); return; }
    const taskNode = event.target.closest('[data-task-id]');
    if (taskNode && !event.target.closest('button, a, input, select')) { openTaskDetail(taskNode.dataset.taskId); return; }
    const action = event.target.closest('[data-action]');
    if (action) { action.dataset.action === 'publish' ? openPublish() : openProfile(); return; }
    if (event.target.closest('#sideProfile') || event.target.closest('#mobileAvatar')) { openProfile(); return; }
    if (event.target.closest('#noticeButton')) { navigate('activity'); return; }
    const walletAction = event.target.closest('[data-wallet-action]');
    if (walletAction) { openWalletAction(walletAction.dataset.walletAction); return; }
    const taskAction = event.target.closest('[data-task-action]');
    if (taskAction) {
      const handlers = { apply: openApplicationForm, applications: openApplications, chat: openChat, deliver: openDelivery, revise: reviseTask, approve: approveTask, pay: openPayment };
      handlers[taskAction.dataset.taskAction]?.(taskAction.dataset.id); return;
    }
    const applicationChoice = event.target.closest('[data-select-application]');
    if (applicationChoice) { selectApplication(applicationChoice.dataset.task, applicationChoice.dataset.selectApplication); return; }
    const confirmPayment = event.target.closest('[data-confirm-payment]');
    if (confirmPayment) { completeDirectPayment(confirmPayment.dataset.confirmPayment); return; }
    const switcher = event.target.closest('[data-switch-account]');
    if (switcher) { switchAccount(switcher.dataset.switchAccount); return; }
    if (event.target.closest('[data-logout]')) { state.sessionUserId = null; saveState(); closeModal(); renderLogin(); return; }
    if (event.target.closest('[data-reset-demo]')) { localStorage.removeItem(STORAGE_KEY); state = seedState(); selectedLoginId = 'u1'; closeModal(); renderLogin(); toast('演示数据已重置'); return; }
    if (event.target.closest('[data-close-modal]') || (event.target.classList.contains('modal-backdrop'))) { closeModal(); return; }
    if (event.target.closest('#markRead')) { $('#noticeButton')?.classList.remove('has-dot'); toast('所有动态已标为已读'); }
  });

  document.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.id === 'publishForm') submitPublish(event.target);
    if (event.target.id === 'applicationForm') submitApplication(event.target);
    if (event.target.id === 'chatForm') submitChat(event.target);
    if (event.target.id === 'deliveryForm') submitDelivery(event.target);
    if (event.target.id === 'moneyForm') submitMoney(event.target);
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'sortSelect') { state.marketSort = event.target.value; saveState(); renderMarket(); }
    if (event.target.id === 'statusFilter' && event.target.value === '仅看可报名') {
      state.marketCategory = '全部'; state.marketSearch = '';
      const open = state.tasks.filter(task => task.status === 'open');
      $('#marketView .task-grid').innerHTML = open.map(taskCard).join('');
      $('#marketView .result-count').textContent = `找到 ${open.length} 个需求`;
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#globalSearch')?.focus(); }
    if (event.key === 'Enter') {
      const task = event.target.closest('[data-task-id]');
      if (task) openTaskDetail(task.dataset.taskId);
    }
  });

  $('#globalSearch').addEventListener('input', event => {
    state.marketSearch = event.target.value;
    state.currentView = 'market';
    saveState(); renderMarket(); navigate('market', false);
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  renderAll();
})();
