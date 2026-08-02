export const knowledgeLocale = {
  "en-US": {
    // Nav / resources
    "knowledge.resources.overview": "KB Overview",
    "knowledge.resources.articles": "Articles",
    "knowledge.resources.article": "Article",
    "knowledge.resources.articles.description":
      "Browse and search the knowledge base by category.",
    "knowledge.resources.categories": "Categories",
    "knowledge.resources.category": "Category",
    "knowledge.resources.categories.description":
      "The topic tree that organizes every article.",
    "knowledge.resources.search": "Search",
    "knowledge.resources.search.description":
      "Search the knowledge base by title, summary, or body.",
    "knowledge.resources.tags": "Topics",
    "knowledge.resources.tags.description":
      "Browse articles grouped by topic.",

    // Common
    "knowledge.common.close": "Close",
    "knowledge.common.cancel": "Cancel",
    "knowledge.common.save": "Save changes",
    "knowledge.common.saving": "Saving...",
    "knowledge.common.untitled": "Untitled",
    "knowledge.common.uncategorized": "Uncategorized",
    "knowledge.common.unknown": "Unknown",

    // Status enum
    "knowledge.enums.status.draft": "Draft",
    "knowledge.enums.status.published": "Published",

    // Pickers
    "knowledge.pickers.uncategorized": "Uncategorized",
    "knowledge.pickers.author.placeholder": "Select an author",
    "knowledge.pickers.author.search": "Search people...",
    "knowledge.pickers.noResults": "No results",
    "knowledge.pickers.clear": "Clear",

    // Category tree filter
    "knowledge.tree.title": "Categories",
    "knowledge.tree.all": "All articles",
    "knowledge.tree.collapse": "Collapse",
    "knowledge.tree.expand": "Expand",

    // Articles list
    "knowledge.articles.title": "Articles",
    "knowledge.articles.subtitle":
      "Browse the knowledge base by category, or search across every article.",
    "knowledge.articles.new": "New article",
    "knowledge.articles.search": "Search articles...",
    "knowledge.articles.filter.all": "All",
    "knowledge.articles.filter.published": "Published",
    "knowledge.articles.filter.draft": "Draft",
    "knowledge.articles.empty.title": "No articles found",
    "knowledge.articles.empty.description":
      "Try a different category or search term, or write a new article.",
    "knowledge.articles.card.read": "Read",
    "knowledge.articles.card.edit": "Edit",

    // Article drawer / form
    "knowledge.articles.drawer.create.title": "New article",
    "knowledge.articles.drawer.create.description":
      "Draft a knowledge base article.",
    "knowledge.articles.drawer.edit.title": "Edit article",
    "knowledge.articles.drawer.edit.description":
      "Update this article's content or status.",
    "knowledge.articles.form.publishing": "Publishing...",
    "knowledge.articles.form.save": "Save article",
    "knowledge.articles.fields.title": "Title",
    "knowledge.articles.fields.title.placeholder":
      "e.g. Incident response runbook",
    "knowledge.articles.fields.title.required": "Title is required",
    "knowledge.articles.fields.category": "Category",
    "knowledge.articles.fields.status": "Status",
    "knowledge.articles.fields.status.placeholder": "Select status",
    "knowledge.articles.fields.author": "Author",
    "knowledge.articles.fields.summary": "Summary",
    "knowledge.articles.fields.summary.placeholder":
      "A one-line teaser shown on the article card.",
    "knowledge.articles.fields.body": "Body",
    "knowledge.articles.fields.body.placeholder":
      "Write the article. Separate paragraphs with a blank line.",

    // Article reader (show)
    "knowledge.reader.back": "Back to articles",
    "knowledge.reader.edit": "Edit",
    "knowledge.reader.giveFeedback": "Give feedback",
    "knowledge.reader.error.title": "Unable to load article",
    "knowledge.reader.error.description":
      "The article may no longer exist, or you may not have permission to view it.",
    "knowledge.reader.author.unknown": "Unknown author",
    "knowledge.reader.updatedPrefix": "Updated",
    "knowledge.reader.views": "views",
    "knowledge.reader.empty": "This article has no content yet.",
    "knowledge.reader.related.title": "Related articles",

    // Feedback (nested drawer + panel)
    "knowledge.feedback.drawer.title": "Leave feedback",
    "knowledge.feedback.drawer.description":
      "Tell the author whether this article was helpful.",
    "knowledge.feedback.fields.rating": "Was this article helpful?",
    "knowledge.feedback.fields.comment": "Comment (optional)",
    "knowledge.feedback.fields.comment.placeholder":
      "What worked, or what's missing?",
    "knowledge.feedback.rating.helpful": "Helpful",
    "knowledge.feedback.rating.notHelpful": "Not helpful",
    "knowledge.feedback.submit": "Submit feedback",
    "knowledge.feedback.panel.title": "Feedback",
    "knowledge.feedback.panel.empty":
      "No feedback yet. Be the first to weigh in.",

    // Categories list
    "knowledge.categories.title": "Categories",
    "knowledge.categories.subtitle":
      "The topic tree that organizes {{count}} articles. Nest categories to build up to two levels.",
    "knowledge.categories.new": "New category",
    "knowledge.categories.empty.title": "No categories yet",
    "knowledge.categories.empty.description":
      "Create your first category to start organizing articles.",
    "knowledge.categories.card.articles": "{{count}} articles",
    "knowledge.categories.card.subcategories": "{{count}} sub-categories",

    // Category drawer / form
    "knowledge.categories.drawer.create.title": "New category",
    "knowledge.categories.drawer.create.description":
      "Group articles under a topic. Nest it under a parent to build a tree.",
    "knowledge.categories.drawer.edit.title": "Edit category",
    "knowledge.categories.drawer.edit.description":
      "Rename this category or move it under a different parent.",
    "knowledge.categories.form.adding": "Adding...",
    "knowledge.categories.form.add": "Add category",
    "knowledge.categories.fields.name": "Name",
    "knowledge.categories.fields.name.placeholder": "e.g. Engineering",
    "knowledge.categories.fields.name.required": "Name is required",
    "knowledge.categories.fields.parent": "Parent category",
    "knowledge.categories.fields.description": "Description",
    "knowledge.categories.fields.description.placeholder":
      "What belongs in this category?",

    // Overview / dashboard
    "knowledge.overview.title": "Knowledge base",
    "knowledge.overview.subtitle":
      "What's documented, what's still in draft, and the articles people read most.",
    "knowledge.overview.kpi.total": "Total articles",
    "knowledge.overview.kpi.total.sub": "Across every category",
    "knowledge.overview.kpi.published": "Published",
    "knowledge.overview.kpi.published.sub": "Live for everyone",
    "knowledge.overview.kpi.drafts": "Drafts",
    "knowledge.overview.kpi.drafts.sub": "Not yet published",
    "knowledge.overview.kpi.views": "Total views",
    "knowledge.overview.kpi.views.sub": "All-time reads",
    "knowledge.overview.byStatus.title": "Articles by status",
    "knowledge.overview.byStatus.description": "Published versus draft.",
    "knowledge.overview.byCategory.title": "Articles by category",
    "knowledge.overview.byCategory.description":
      "How coverage is spread across top-level topics.",
    "knowledge.overview.mostViewed.title": "Most viewed",
    "knowledge.overview.mostViewed.description":
      "The articles your team reads most.",
    "knowledge.overview.mostViewed.empty": "No articles yet.",

    // Search
    "knowledge.search.title": "Search",
    "knowledge.search.subtitle":
      "Search across every article's title, summary, and body.",
    "knowledge.search.placeholder": "Search articles by title, summary, or body...",
    "knowledge.search.resultsCount_one": "{{count}} result",
    "knowledge.search.resultsCount_other": "{{count}} results",
    "knowledge.search.empty.prompt.title": "Start typing to search",
    "knowledge.search.empty.prompt.description":
      "Search matches article titles, summaries, and body text.",
    "knowledge.search.empty.noResults.title": "No matches found",
    "knowledge.search.empty.noResults.description":
      "Try a shorter or different search term.",

    // Tags / topics browse
    "knowledge.tags.title": "Topics",
    "knowledge.tags.subtitle":
      "Browse articles by topic. Click a topic to filter the list below.",
    "knowledge.tags.all": "All topics",
    "knowledge.tags.empty.title": "No categories yet",
    "knowledge.tags.empty.description":
      "Create a category to start grouping articles by topic.",
    "knowledge.tags.results.empty.title": "No articles in this topic",
    "knowledge.tags.results.empty.description":
      "Pick a different topic, or view all articles.",

    // Article detail drawer (nested show)
    "knowledge.articles.drawer.show.description":
      "Article details and reader feedback.",
    "knowledge.articles.drawer.show.overview": "Overview",
    "knowledge.articles.drawer.show.openFull": "Open full",

    // Feedback detail drawer (nested)
    "knowledge.feedback.show.title": "Feedback",
    "knowledge.feedback.show.description":
      "A reader's response to this article.",
    "knowledge.feedback.show.overview": "Overview",
    "knowledge.feedback.show.rating": "Rating",
    "knowledge.feedback.show.author": "Reader",
    "knowledge.feedback.show.submitted": "Submitted",
    "knowledge.feedback.show.comment": "Comment",
    "knowledge.feedback.show.noComment": "No comment left.",
    "knowledge.feedback.show.error.title": "Unable to load feedback",
    "knowledge.feedback.show.error.description":
      "This feedback may no longer exist.",

    // Category detail drawer (show)
    "knowledge.categories.drawer.show.description":
      "Category details and the articles filed under it.",
    "knowledge.categories.show.overview": "Overview",
    "knowledge.categories.show.noParent": "Top level",
    "knowledge.categories.show.articles": "Articles ({{count}})",
    "knowledge.categories.show.addArticle": "Add article",
    "knowledge.categories.show.articles.empty":
      "No articles in this category yet.",
    "knowledge.categories.show.columns.title": "Title",
    "knowledge.categories.show.columns.status": "Status",
    "knowledge.categories.show.columns.views": "Views",
    "knowledge.categories.show.columns.updated": "Updated",
    "knowledge.categories.show.columns.actions": "Actions",
    "knowledge.categories.show.error.title": "Unable to load category",
    "knowledge.categories.show.error.description":
      "The category may no longer exist, or you may not have permission to view it.",
  },
  "zh-CN": {
    // Nav / resources
    "knowledge.resources.overview": "知识库概览",
    "knowledge.resources.articles": "文章",
    "knowledge.resources.article": "文章",
    "knowledge.resources.articles.description": "按分类浏览和搜索知识库。",
    "knowledge.resources.categories": "分类",
    "knowledge.resources.category": "分类",
    "knowledge.resources.categories.description": "组织所有文章的主题树。",
    "knowledge.resources.search": "搜索",
    "knowledge.resources.search.description": "按标题、摘要或正文搜索知识库。",
    "knowledge.resources.tags": "标签浏览",
    "knowledge.resources.tags.description": "按主题浏览文章。",

    // Common
    "knowledge.common.close": "关闭",
    "knowledge.common.cancel": "取消",
    "knowledge.common.save": "保存更改",
    "knowledge.common.saving": "保存中...",
    "knowledge.common.untitled": "未命名",
    "knowledge.common.uncategorized": "未分类",
    "knowledge.common.unknown": "未知",

    // Status enum
    "knowledge.enums.status.draft": "草稿",
    "knowledge.enums.status.published": "已发布",

    // Pickers
    "knowledge.pickers.uncategorized": "未分类",
    "knowledge.pickers.author.placeholder": "选择作者",
    "knowledge.pickers.author.search": "搜索人员...",
    "knowledge.pickers.noResults": "无结果",
    "knowledge.pickers.clear": "清除",

    // Category tree filter
    "knowledge.tree.title": "分类",
    "knowledge.tree.all": "全部文章",
    "knowledge.tree.collapse": "收起",
    "knowledge.tree.expand": "展开",

    // Articles list
    "knowledge.articles.title": "文章",
    "knowledge.articles.subtitle": "按分类浏览知识库,或跨全部文章搜索。",
    "knowledge.articles.new": "新建文章",
    "knowledge.articles.search": "搜索文章...",
    "knowledge.articles.filter.all": "全部",
    "knowledge.articles.filter.published": "已发布",
    "knowledge.articles.filter.draft": "草稿",
    "knowledge.articles.empty.title": "未找到文章",
    "knowledge.articles.empty.description":
      "尝试其他分类或搜索词,或撰写一篇新文章。",
    "knowledge.articles.card.read": "阅读",
    "knowledge.articles.card.edit": "编辑",

    // Article drawer / form
    "knowledge.articles.drawer.create.title": "新建文章",
    "knowledge.articles.drawer.create.description": "撰写一篇知识库文章。",
    "knowledge.articles.drawer.edit.title": "编辑文章",
    "knowledge.articles.drawer.edit.description": "更新文章的内容或状态。",
    "knowledge.articles.form.publishing": "发布中...",
    "knowledge.articles.form.save": "保存文章",
    "knowledge.articles.fields.title": "标题",
    "knowledge.articles.fields.title.placeholder": "例如:事故响应手册",
    "knowledge.articles.fields.title.required": "标题为必填项",
    "knowledge.articles.fields.category": "分类",
    "knowledge.articles.fields.status": "状态",
    "knowledge.articles.fields.status.placeholder": "选择状态",
    "knowledge.articles.fields.author": "作者",
    "knowledge.articles.fields.summary": "摘要",
    "knowledge.articles.fields.summary.placeholder":
      "显示在文章卡片上的一行简介。",
    "knowledge.articles.fields.body": "正文",
    "knowledge.articles.fields.body.placeholder":
      "撰写文章。用空行分隔段落。",

    // Article reader (show)
    "knowledge.reader.back": "返回文章列表",
    "knowledge.reader.edit": "编辑",
    "knowledge.reader.giveFeedback": "反馈",
    "knowledge.reader.error.title": "无法加载文章",
    "knowledge.reader.error.description":
      "该文章可能已不存在,或您没有查看权限。",
    "knowledge.reader.author.unknown": "未知作者",
    "knowledge.reader.updatedPrefix": "更新于",
    "knowledge.reader.views": "次浏览",
    "knowledge.reader.empty": "这篇文章暂无内容。",
    "knowledge.reader.related.title": "相关文章",

    // Feedback (nested drawer + panel)
    "knowledge.feedback.drawer.title": "提交反馈",
    "knowledge.feedback.drawer.description": "告诉作者这篇文章是否对你有帮助。",
    "knowledge.feedback.fields.rating": "这篇文章对你有帮助吗?",
    "knowledge.feedback.fields.comment": "评论(可选)",
    "knowledge.feedback.fields.comment.placeholder": "哪里做得好,或者缺了什么?",
    "knowledge.feedback.rating.helpful": "有帮助",
    "knowledge.feedback.rating.notHelpful": "没帮助",
    "knowledge.feedback.submit": "提交反馈",
    "knowledge.feedback.panel.title": "反馈",
    "knowledge.feedback.panel.empty": "暂无反馈,来抢个沙发。",

    // Categories list
    "knowledge.categories.title": "分类",
    "knowledge.categories.subtitle":
      "组织 {{count}} 篇文章的主题树。分类最多可嵌套两级。",
    "knowledge.categories.new": "新建分类",
    "knowledge.categories.empty.title": "暂无分类",
    "knowledge.categories.empty.description":
      "创建第一个分类,开始组织文章。",
    "knowledge.categories.card.articles": "{{count}} 篇文章",
    "knowledge.categories.card.subcategories": "{{count}} 个子分类",

    // Category drawer / form
    "knowledge.categories.drawer.create.title": "新建分类",
    "knowledge.categories.drawer.create.description":
      "将文章归入某个主题。可嵌套在父分类下形成树形结构。",
    "knowledge.categories.drawer.edit.title": "编辑分类",
    "knowledge.categories.drawer.edit.description":
      "重命名此分类,或将其移动到其他父分类下。",
    "knowledge.categories.form.adding": "添加中...",
    "knowledge.categories.form.add": "添加分类",
    "knowledge.categories.fields.name": "名称",
    "knowledge.categories.fields.name.placeholder": "例如:工程",
    "knowledge.categories.fields.name.required": "名称为必填项",
    "knowledge.categories.fields.parent": "父分类",
    "knowledge.categories.fields.description": "描述",
    "knowledge.categories.fields.description.placeholder": "这个分类包含哪些内容?",

    // Overview / dashboard
    "knowledge.overview.title": "知识库",
    "knowledge.overview.subtitle":
      "已归档的内容、仍在草稿中的内容,以及大家阅读最多的文章。",
    "knowledge.overview.kpi.total": "文章总数",
    "knowledge.overview.kpi.total.sub": "覆盖所有分类",
    "knowledge.overview.kpi.published": "已发布",
    "knowledge.overview.kpi.published.sub": "对所有人可见",
    "knowledge.overview.kpi.drafts": "草稿",
    "knowledge.overview.kpi.drafts.sub": "尚未发布",
    "knowledge.overview.kpi.views": "浏览总数",
    "knowledge.overview.kpi.views.sub": "历史累计阅读",
    "knowledge.overview.byStatus.title": "各状态文章",
    "knowledge.overview.byStatus.description": "已发布与草稿对比。",
    "knowledge.overview.byCategory.title": "各分类文章",
    "knowledge.overview.byCategory.description": "各顶级主题的内容分布情况。",
    "knowledge.overview.mostViewed.title": "浏览最多",
    "knowledge.overview.mostViewed.description": "团队阅读最多的文章。",
    "knowledge.overview.mostViewed.empty": "暂无文章。",

    // Search
    "knowledge.search.title": "搜索",
    "knowledge.search.subtitle": "在全部文章的标题、摘要和正文中搜索。",
    "knowledge.search.placeholder": "按标题、摘要或正文搜索文章...",
    "knowledge.search.resultsCount_other": "{{count}} 条结果",
    "knowledge.search.empty.prompt.title": "输入关键词开始搜索",
    "knowledge.search.empty.prompt.description": "搜索会匹配文章标题、摘要和正文。",
    "knowledge.search.empty.noResults.title": "未找到匹配结果",
    "knowledge.search.empty.noResults.description": "尝试更短或不同的搜索词。",

    // Tags / topics browse
    "knowledge.tags.title": "标签浏览",
    "knowledge.tags.subtitle": "按主题浏览文章。点击主题可筛选下方列表。",
    "knowledge.tags.all": "全部主题",
    "knowledge.tags.empty.title": "暂无分类",
    "knowledge.tags.empty.description": "创建一个分类,开始按主题归类文章。",
    "knowledge.tags.results.empty.title": "该主题下暂无文章",
    "knowledge.tags.results.empty.description": "换一个主题试试,或查看全部文章。",

    // Article detail drawer (nested show)
    "knowledge.articles.drawer.show.description": "文章详情与读者反馈。",
    "knowledge.articles.drawer.show.overview": "概览",
    "knowledge.articles.drawer.show.openFull": "打开全文",

    // Feedback detail drawer (nested)
    "knowledge.feedback.show.title": "反馈",
    "knowledge.feedback.show.description": "读者对这篇文章的回应。",
    "knowledge.feedback.show.overview": "概览",
    "knowledge.feedback.show.rating": "评价",
    "knowledge.feedback.show.author": "读者",
    "knowledge.feedback.show.submitted": "提交于",
    "knowledge.feedback.show.comment": "评论",
    "knowledge.feedback.show.noComment": "未留下评论。",
    "knowledge.feedback.show.error.title": "无法加载反馈",
    "knowledge.feedback.show.error.description": "该反馈可能已不存在。",

    // Category detail drawer (show)
    "knowledge.categories.drawer.show.description": "分类详情及其下的文章。",
    "knowledge.categories.show.overview": "概览",
    "knowledge.categories.show.noParent": "顶级分类",
    "knowledge.categories.show.articles": "文章({{count}})",
    "knowledge.categories.show.addArticle": "新增文章",
    "knowledge.categories.show.articles.empty": "该分类下暂无文章。",
    "knowledge.categories.show.columns.title": "标题",
    "knowledge.categories.show.columns.status": "状态",
    "knowledge.categories.show.columns.views": "浏览",
    "knowledge.categories.show.columns.updated": "更新时间",
    "knowledge.categories.show.columns.actions": "操作",
    "knowledge.categories.show.error.title": "无法加载分类",
    "knowledge.categories.show.error.description":
      "该分类可能已不存在,或你没有查看权限。",
  },
};
