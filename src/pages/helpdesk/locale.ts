const enUS = {
  // Nav / resources
  "helpdesk.resources.tickets": "Helpdesk",
  "helpdesk.resources.ticket": "Ticket",
  "helpdesk.resources.tickets.description":
    "Support tickets, priorities and the reply thread.",

  // Common
  "helpdesk.common.unassigned": "Unassigned",

  // Enums — status
  "helpdesk.enums.status.open": "Open",
  "helpdesk.enums.status.pending": "Pending",
  "helpdesk.enums.status.resolved": "Resolved",
  "helpdesk.enums.status.closed": "Closed",

  // Enums — priority
  "helpdesk.enums.priority.low": "Low",
  "helpdesk.enums.priority.med": "Medium",
  "helpdesk.enums.priority.high": "High",
  "helpdesk.enums.priority.urgent": "Urgent",

  // Enums — category
  "helpdesk.enums.category.billing": "Billing",
  "helpdesk.enums.category.technical": "Technical",
  "helpdesk.enums.category.account": "Account",
  "helpdesk.enums.category.other": "Other",

  // Relative time
  "helpdesk.time.justNow": "just now",
  "helpdesk.time.minutes": "{{count}}m ago",
  "helpdesk.time.hours": "{{count}}h ago",
  "helpdesk.time.days": "{{count}}d ago",
  "helpdesk.time.months": "{{count}}mo ago",

  // Board / list
  "helpdesk.board.title": "Helpdesk",
  "helpdesk.board.subtitle":
    "Every support request from open to closed, with priorities, owners and the full reply thread.",
  "helpdesk.board.newTicket": "New ticket",
  "helpdesk.board.emptyColumn": "Nothing here",
  "helpdesk.board.untitled": "Untitled ticket",

  // KPI tiles
  "helpdesk.kpi.open.label": "Open tickets",
  "helpdesk.kpi.open.hint": "Open + pending",
  "helpdesk.kpi.attention.label": "Needs attention",
  "helpdesk.kpi.attention.hint": "High / urgent, still open",
  "helpdesk.kpi.resolution.label": "Resolution rate",
  "helpdesk.kpi.resolution.hint": "{{count}} resolved / closed",
  "helpdesk.kpi.replies.label": "Total replies",
  "helpdesk.kpi.replies.hint": "Across all tickets",

  // Chart
  "helpdesk.chart.priority.title": "Open tickets by priority",
  "helpdesk.chart.priority.description":
    "Where the pressure sits right now across open and pending work.",

  // Detail / show
  "helpdesk.show.fallbackTitle": "Ticket",
  "helpdesk.show.description":
    "Full history of this support request, with the reply thread.",
  "helpdesk.show.editTicket": "Edit ticket",
  "helpdesk.show.errorTitle": "Unable to load ticket",
  "helpdesk.show.errorDescription":
    "The ticket may no longer exist, or you may not have permission to view it.",
  "helpdesk.show.noDescription": "No description provided.",
  "helpdesk.show.details": "Details",
  "helpdesk.show.opened": "Opened",
  "helpdesk.show.lastUpdated": "Last updated",

  // Field labels
  "helpdesk.fields.subject": "Subject",
  "helpdesk.fields.description": "Description",
  "helpdesk.fields.category": "Category",
  "helpdesk.fields.priority": "Priority",
  "helpdesk.fields.status": "Status",
  "helpdesk.fields.requester": "Requester",
  "helpdesk.fields.assignee": "Assignee",

  // Replies thread
  "helpdesk.thread.title": "Replies",
  "helpdesk.thread.count": "{{count}} messages",
  "helpdesk.thread.empty": "No replies yet. Start the conversation below.",
  "helpdesk.thread.placeholder": "Write a reply...",
  "helpdesk.thread.sending": "Sending...",
  "helpdesk.thread.send": "Send reply",

  // Forms
  "helpdesk.form.create.title": "New ticket",
  "helpdesk.form.create.description":
    "Log a new support request and route it to an agent.",
  "helpdesk.form.create.submit": "Create ticket",
  "helpdesk.form.create.submitting": "Creating...",
  "helpdesk.form.edit.title": "Edit ticket",
  "helpdesk.form.edit.description":
    "Update the details, priority, status or assignment.",
  "helpdesk.form.edit.submit": "Save changes",
  "helpdesk.form.edit.submitting": "Saving...",
  "helpdesk.form.fields.subject.required": "Subject is required",
  "helpdesk.form.fields.subject.placeholder": "Short summary of the issue",
  "helpdesk.form.fields.description.placeholder":
    "Describe the problem, steps to reproduce, and impact",
  "helpdesk.form.fields.category.unspecified": "Unspecified",
  "helpdesk.form.fields.requester.placeholder": "Who raised this ticket?",
  "helpdesk.form.fields.assignee.placeholder": "Assign an agent",
};

const zhCN: Record<keyof typeof enUS, string> = {
  // Nav / resources
  "helpdesk.resources.tickets": "帮助台",
  "helpdesk.resources.ticket": "工单",
  "helpdesk.resources.tickets.description": "支持工单、优先级与回复记录。",

  // Common
  "helpdesk.common.unassigned": "未分配",

  // Enums — status
  "helpdesk.enums.status.open": "待处理",
  "helpdesk.enums.status.pending": "处理中",
  "helpdesk.enums.status.resolved": "已解决",
  "helpdesk.enums.status.closed": "已关闭",

  // Enums — priority
  "helpdesk.enums.priority.low": "低",
  "helpdesk.enums.priority.med": "中",
  "helpdesk.enums.priority.high": "高",
  "helpdesk.enums.priority.urgent": "紧急",

  // Enums — category
  "helpdesk.enums.category.billing": "账单",
  "helpdesk.enums.category.technical": "技术",
  "helpdesk.enums.category.account": "账户",
  "helpdesk.enums.category.other": "其他",

  // Relative time
  "helpdesk.time.justNow": "刚刚",
  "helpdesk.time.minutes": "{{count}} 分钟前",
  "helpdesk.time.hours": "{{count}} 小时前",
  "helpdesk.time.days": "{{count}} 天前",
  "helpdesk.time.months": "{{count}} 个月前",

  // Board / list
  "helpdesk.board.title": "帮助台",
  "helpdesk.board.subtitle":
    "从创建到关闭的每一条支持请求，含优先级、负责人与完整回复记录。",
  "helpdesk.board.newTicket": "新建工单",
  "helpdesk.board.emptyColumn": "暂无工单",
  "helpdesk.board.untitled": "未命名工单",

  // KPI tiles
  "helpdesk.kpi.open.label": "待处理工单",
  "helpdesk.kpi.open.hint": "待处理 + 处理中",
  "helpdesk.kpi.attention.label": "需要关注",
  "helpdesk.kpi.attention.hint": "高 / 紧急且尚未关闭",
  "helpdesk.kpi.resolution.label": "解决率",
  "helpdesk.kpi.resolution.hint": "{{count}} 项已解决 / 已关闭",
  "helpdesk.kpi.replies.label": "回复总数",
  "helpdesk.kpi.replies.hint": "所有工单合计",

  // Chart
  "helpdesk.chart.priority.title": "按优先级的待处理工单",
  "helpdesk.chart.priority.description":
    "当前待处理与处理中的工作压力集中在哪里。",

  // Detail / show
  "helpdesk.show.fallbackTitle": "工单",
  "helpdesk.show.description": "这条支持请求的完整记录，含回复往来。",
  "helpdesk.show.editTicket": "编辑工单",
  "helpdesk.show.errorTitle": "无法加载工单",
  "helpdesk.show.errorDescription": "该工单可能已不存在，或你没有查看权限。",
  "helpdesk.show.noDescription": "未提供描述。",
  "helpdesk.show.details": "详细信息",
  "helpdesk.show.opened": "创建时间",
  "helpdesk.show.lastUpdated": "最后更新",

  // Field labels
  "helpdesk.fields.subject": "主题",
  "helpdesk.fields.description": "描述",
  "helpdesk.fields.category": "分类",
  "helpdesk.fields.priority": "优先级",
  "helpdesk.fields.status": "状态",
  "helpdesk.fields.requester": "报告人",
  "helpdesk.fields.assignee": "处理人",

  // Replies thread
  "helpdesk.thread.title": "回复",
  "helpdesk.thread.count": "{{count}} 条消息",
  "helpdesk.thread.empty": "还没有回复。在下方开始对话吧。",
  "helpdesk.thread.placeholder": "写下回复……",
  "helpdesk.thread.sending": "发送中……",
  "helpdesk.thread.send": "发送回复",

  // Forms
  "helpdesk.form.create.title": "新建工单",
  "helpdesk.form.create.description": "记录一条新的支持请求并分派给客服。",
  "helpdesk.form.create.submit": "创建工单",
  "helpdesk.form.create.submitting": "创建中……",
  "helpdesk.form.edit.title": "编辑工单",
  "helpdesk.form.edit.description": "更新详情、优先级、状态或指派。",
  "helpdesk.form.edit.submit": "保存更改",
  "helpdesk.form.edit.submitting": "保存中……",
  "helpdesk.form.fields.subject.required": "主题为必填项",
  "helpdesk.form.fields.subject.placeholder": "问题的简短概述",
  "helpdesk.form.fields.description.placeholder": "描述问题、复现步骤与影响",
  "helpdesk.form.fields.category.unspecified": "未指定",
  "helpdesk.form.fields.requester.placeholder": "谁提交了这条工单？",
  "helpdesk.form.fields.assignee.placeholder": "指派一位客服",
};

export const helpdeskLocale = {
  "en-US": enUS,
  "zh-CN": zhCN,
};
