export const assetsLocale = {
  "en-US": {
    // Nav / resources
    "assets.resources.assets": "Assets",
    "assets.resources.asset": "Asset",
    "assets.resources.assets.description":
      "The company asset register — every device, its category, status and value.",
    "assets.resources.assignments": "Assignments",
    "assets.resources.assignment": "Assignment",
    "assets.resources.assignments.description":
      "Who has what — active and returned device assignments across the company.",
    "assets.resources.maintenance": "Maintenance",
    "assets.resources.maintenance.description":
      "Devices in repair and aging assets that may need a warranty check.",

    // Common
    "assets.common.close": "Close",
    "assets.common.cancel": "Cancel",
    "assets.common.save": "Save changes",
    "assets.common.saving": "Saving...",
    "assets.common.actions": "Actions",
    "assets.common.view": "View",

    // Enums — category
    "assets.enums.category.laptop": "Laptop",
    "assets.enums.category.monitor": "Monitor",
    "assets.enums.category.phone": "Phone",
    "assets.enums.category.peripheral": "Peripheral",
    "assets.enums.category.other": "Other",

    // Enums — status
    "assets.enums.status.in_stock": "In stock",
    "assets.enums.status.assigned": "Assigned",
    "assets.enums.status.repair": "Repair",
    "assets.enums.status.retired": "Retired",

    // Asset fields
    "assets.assets.fields.tag": "Tag",
    "assets.assets.fields.name": "Name",
    "assets.assets.fields.category": "Category",
    "assets.assets.fields.status": "Status",
    "assets.assets.fields.value": "Value",
    "assets.assets.fields.purchased": "Purchased",
    "assets.assets.fields.purchaseDate": "Purchase date",

    // Asset form
    "assets.assets.form.tagRequired": "Asset tag is required",
    "assets.assets.form.tagPlaceholder": "e.g. AS-1024",
    "assets.assets.form.nameRequired": "Name is required",
    "assets.assets.form.namePlaceholder": 'e.g. MacBook Pro 16"',
    "assets.assets.form.categoryUnspecified": "Unspecified",
    "assets.assets.form.creating": "Adding...",
    "assets.assets.form.create": "Add asset",

    // Asset drawers
    "assets.assets.drawer.create.title": "Add asset",
    "assets.assets.drawer.create.description":
      "Register a new device in the asset register.",
    "assets.assets.drawer.edit.title": "Edit asset",
    "assets.assets.drawer.edit.description": "Update this device's details.",
    "assets.assets.drawer.show.description":
      "Profile and full assignment history for this device.",

    // Asset detail
    "assets.assets.detail.unnamed": "Asset",
    "assets.assets.detail.profile": "Profile",
    "assets.assets.detail.added": "Added",
    "assets.assets.detail.loadError.title": "Unable to load asset",
    "assets.assets.detail.loadError.description":
      "The asset may no longer exist, or you may not have permission to view it.",

    // Assignment history (inside asset detail)
    "assets.assets.history.title": "Assignment history",
    "assets.assets.history.returnActiveFirst":
      "Return the active assignment before reassigning",
    "assets.assets.history.assignThis": "Assign this device",
    "assets.assets.history.assign": "Assign",
    "assets.assets.history.headers.assignee": "Assignee",
    "assets.assets.history.headers.assigned": "Assigned",
    "assets.assets.history.headers.returned": "Returned",
    "assets.assets.history.headers.note": "Note",
    "assets.assets.history.empty":
      "Never assigned. Use Assign to hand this device to someone.",

    // KPI tiles
    "assets.kpi.totalAssets": "Total assets",
    "assets.kpi.totalAssets.hint": "{{value}} book value",
    "assets.kpi.assigned": "Assigned",
    "assets.kpi.assigned.hint": "In use by staff",
    "assets.kpi.inStock": "In stock",
    "assets.kpi.inStock.hint": "Ready to assign",
    "assets.kpi.inRepair": "In repair",
    "assets.kpi.inRepair.hint": "Out for service",

    // Charts
    "assets.charts.seriesAssets": "Assets",
    "assets.charts.byStatus.title": "By status",
    "assets.charts.byStatus.description": "Where every device sits right now.",
    "assets.charts.byCategory.title": "By category",
    "assets.charts.byCategory.description": "Inventory mix across device types.",

    // Assignment list
    "assets.assignments.columns.asset": "Asset",
    "assets.assignments.columns.assignee": "Assignee",
    "assets.assignments.columns.assigned": "Assigned",
    "assets.assignments.columns.status": "Status",
    "assets.assignments.active": "Active",
    "assets.assignments.returnedPrefix": "Returned",
    "assets.assignments.actions.return": "Return",

    // Assignment detail (show)
    "assets.assignments.show.unnamed": "Assignment",
    "assets.assignments.show.description": "Details for this device assignment.",
    "assets.assignments.show.overview": "Overview",
    "assets.assignments.show.error.title": "Unable to load assignment",
    "assets.assignments.show.error.description":
      "The assignment may no longer exist, or you may not have permission to view it.",

    // Assignment drawers
    "assets.assignments.drawer.create.title": "Assign a device",
    "assets.assignments.drawer.create.description":
      "Hand an in-stock asset to a member of staff.",
    "assets.assignments.drawer.nestedAssign.title": "Assign this device",
    "assets.assignments.drawer.nestedAssign.description":
      "Record who is taking this asset and when.",
    "assets.assignments.drawer.edit.title": "Edit assignment",
    "assets.assignments.drawer.edit.description":
      "Update the assignment details or record a return.",

    // Assignment form
    "assets.assignments.form.creating": "Assigning...",
    "assets.assignments.form.create": "Assign device",
    "assets.assignments.form.assetRequired": "Pick an asset to assign",
    "assets.assignments.form.assigneeRequired": "Pick who receives this device",
    "assets.assignments.form.assignedDateRequired": "Assigned date is required",

    // Assignment fields
    "assets.assignments.fields.asset": "Asset",
    "assets.assignments.fields.assetPlaceholder": "Select an in-stock asset",
    "assets.assignments.fields.assignee": "Assignee",
    "assets.assignments.fields.assigneePlaceholder": "Select a person",
    "assets.assignments.fields.assignedDate": "Assigned date",
    "assets.assignments.fields.returnedDate": "Returned date",
    "assets.assignments.fields.note": "Note",
    "assets.assignments.fields.notePlaceholder":
      "Anything worth recording about this assignment",

    // Maintenance & warranty page
    "assets.maintenance.loadError.title": "Unable to load maintenance data",
    "assets.maintenance.loadError.description":
      "Check your connection and try again.",
    "assets.maintenance.chart.title": "Fleet by status",
    "assets.maintenance.chart.description":
      "Where every device sits — repair and aging assets need a closer look.",
    "assets.maintenance.repair.title": "In repair",
    "assets.maintenance.repair.empty": "Nothing is in repair right now.",
    "assets.maintenance.aging.title": "Aging — warranty check recommended",
    "assets.maintenance.aging.hint":
      "Devices purchased more than 3 years ago, in stock or assigned — no explicit warranty field, so age is used as a proxy.",
    "assets.maintenance.aging.empty": "No aging assets — the fleet is fresh.",
    "assets.maintenance.aging.headers.age": "Age",
    "assets.maintenance.aging.yearsValue": "{{count}}y",
  },

  "zh-CN": {
    // Nav / resources
    "assets.resources.assets": "资产",
    "assets.resources.asset": "资产",
    "assets.resources.assets.description":
      "公司资产台账——每一台设备的类别、状态与价值。",
    "assets.resources.assignments": "领用记录",
    "assets.resources.assignment": "领用记录",
    "assets.resources.assignments.description":
      "谁在用什么——全公司在用与已归还的设备领用情况。",
    "assets.resources.maintenance": "维保",
    "assets.resources.maintenance.description":
      "维修中的设备与可能需要检查保修状态的老旧资产。",

    // Common
    "assets.common.close": "关闭",
    "assets.common.cancel": "取消",
    "assets.common.save": "保存修改",
    "assets.common.saving": "保存中...",
    "assets.common.actions": "操作",
    "assets.common.view": "查看",

    // Enums — category
    "assets.enums.category.laptop": "笔记本电脑",
    "assets.enums.category.monitor": "显示器",
    "assets.enums.category.phone": "手机",
    "assets.enums.category.peripheral": "外设",
    "assets.enums.category.other": "其他",

    // Enums — status
    "assets.enums.status.in_stock": "在库",
    "assets.enums.status.assigned": "已领用",
    "assets.enums.status.repair": "维修中",
    "assets.enums.status.retired": "已报废",

    // Asset fields
    "assets.assets.fields.tag": "资产编号",
    "assets.assets.fields.name": "名称",
    "assets.assets.fields.category": "类别",
    "assets.assets.fields.status": "状态",
    "assets.assets.fields.value": "价值",
    "assets.assets.fields.purchased": "购入日期",
    "assets.assets.fields.purchaseDate": "购入日期",

    // Asset form
    "assets.assets.form.tagRequired": "资产编号为必填项",
    "assets.assets.form.tagPlaceholder": "例如 AS-1024",
    "assets.assets.form.nameRequired": "名称为必填项",
    "assets.assets.form.namePlaceholder": '例如 MacBook Pro 16"',
    "assets.assets.form.categoryUnspecified": "未指定",
    "assets.assets.form.creating": "添加中...",
    "assets.assets.form.create": "添加资产",

    // Asset drawers
    "assets.assets.drawer.create.title": "添加资产",
    "assets.assets.drawer.create.description": "在资产台账中登记一台新设备。",
    "assets.assets.drawer.edit.title": "编辑资产",
    "assets.assets.drawer.edit.description": "更新这台设备的信息。",
    "assets.assets.drawer.show.description": "该设备的档案与完整领用历史。",

    // Asset detail
    "assets.assets.detail.unnamed": "资产",
    "assets.assets.detail.profile": "档案",
    "assets.assets.detail.added": "登记时间",
    "assets.assets.detail.loadError.title": "无法加载资产",
    "assets.assets.detail.loadError.description":
      "该资产可能已不存在，或你没有查看权限。",

    // Assignment history (inside asset detail)
    "assets.assets.history.title": "领用历史",
    "assets.assets.history.returnActiveFirst": "重新分配前请先归还当前的领用",
    "assets.assets.history.assignThis": "分配这台设备",
    "assets.assets.history.assign": "分配",
    "assets.assets.history.headers.assignee": "领用人",
    "assets.assets.history.headers.assigned": "领用日期",
    "assets.assets.history.headers.returned": "归还日期",
    "assets.assets.history.headers.note": "备注",
    "assets.assets.history.empty": "从未分配。点击“分配”将设备交给他人。",

    // KPI tiles
    "assets.kpi.totalAssets": "资产总数",
    "assets.kpi.totalAssets.hint": "账面价值 {{value}}",
    "assets.kpi.assigned": "已领用",
    "assets.kpi.assigned.hint": "员工在用",
    "assets.kpi.inStock": "在库",
    "assets.kpi.inStock.hint": "可供分配",
    "assets.kpi.inRepair": "维修中",
    "assets.kpi.inRepair.hint": "送修中",

    // Charts
    "assets.charts.seriesAssets": "资产",
    "assets.charts.byStatus.title": "按状态",
    "assets.charts.byStatus.description": "每台设备当前的所在状态。",
    "assets.charts.byCategory.title": "按类别",
    "assets.charts.byCategory.description": "各设备类型的库存构成。",

    // Assignment list
    "assets.assignments.columns.asset": "资产",
    "assets.assignments.columns.assignee": "领用人",
    "assets.assignments.columns.assigned": "领用日期",
    "assets.assignments.columns.status": "状态",
    "assets.assignments.active": "在用",
    "assets.assignments.returnedPrefix": "已归还",
    "assets.assignments.actions.return": "归还",

    // Assignment detail (show)
    "assets.assignments.show.unnamed": "领用记录",
    "assets.assignments.show.description": "这条设备领用记录的详情。",
    "assets.assignments.show.overview": "概览",
    "assets.assignments.show.error.title": "无法加载领用记录",
    "assets.assignments.show.error.description":
      "该领用记录可能已不存在，或你没有查看权限。",

    // Assignment drawers
    "assets.assignments.drawer.create.title": "分配设备",
    "assets.assignments.drawer.create.description": "将一台在库资产交给某位员工。",
    "assets.assignments.drawer.nestedAssign.title": "分配这台设备",
    "assets.assignments.drawer.nestedAssign.description":
      "记录谁在何时领用了这台资产。",
    "assets.assignments.drawer.edit.title": "编辑领用记录",
    "assets.assignments.drawer.edit.description": "更新领用信息或登记归还。",

    // Assignment form
    "assets.assignments.form.creating": "分配中...",
    "assets.assignments.form.create": "分配设备",
    "assets.assignments.form.assetRequired": "请选择要分配的资产",
    "assets.assignments.form.assigneeRequired": "请选择领用人",
    "assets.assignments.form.assignedDateRequired": "领用日期为必填项",

    // Assignment fields
    "assets.assignments.fields.asset": "资产",
    "assets.assignments.fields.assetPlaceholder": "选择一台在库资产",
    "assets.assignments.fields.assignee": "领用人",
    "assets.assignments.fields.assigneePlaceholder": "选择一位员工",
    "assets.assignments.fields.assignedDate": "领用日期",
    "assets.assignments.fields.returnedDate": "归还日期",
    "assets.assignments.fields.note": "备注",
    "assets.assignments.fields.notePlaceholder": "关于这次领用值得记录的任何信息",

    // Maintenance & warranty page
    "assets.maintenance.loadError.title": "无法加载维保数据",
    "assets.maintenance.loadError.description": "请检查网络连接后重试。",
    "assets.maintenance.chart.title": "设备状态分布",
    "assets.maintenance.chart.description":
      "每台设备当前所在的状态——维修中与老旧资产需要重点关注。",
    "assets.maintenance.repair.title": "维修中",
    "assets.maintenance.repair.empty": "当前没有设备在维修中。",
    "assets.maintenance.aging.title": "老旧资产——建议检查保修状态",
    "assets.maintenance.aging.hint":
      "采购超过 3 年、状态为在库或在用的设备——尚无独立的保修字段，暂以设备年龄作为参考依据。",
    "assets.maintenance.aging.empty": "没有老旧资产——设备均较新。",
    "assets.maintenance.aging.headers.age": "使用年限",
    "assets.maintenance.aging.yearsValue": "{{count}} 年",
  },
};
