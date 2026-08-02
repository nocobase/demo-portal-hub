export const inventoryLocale = {
  "en-US": {
    // Nav / resources
    "inventory.resources.dashboard": "Inventory",
    "inventory.resources.dashboard.description":
      "On-hand stock, low-stock alerts and movement trends.",
    "inventory.resources.products": "Products",
    "inventory.resources.product": "Product",
    "inventory.resources.products.description":
      "The catalog with on-hand levels and reorder points.",
    "inventory.resources.warehouses": "Warehouses",
    "inventory.resources.warehouse": "Warehouse",
    "inventory.resources.warehouses.description":
      "Stocking locations and units held at each.",
    "inventory.resources.stockMoves": "Stock moves",
    "inventory.resources.stockMove": "Stock move",
    "inventory.resources.stockMoves.description":
      "Every receipt, issue and adjustment across warehouses.",
    "inventory.resources.reorder": "Reorder",
    "inventory.resources.reorder.description":
      "Products at or below their reorder level with a suggested reorder quantity.",

    // Reorder page
    "inventory.reorder.title": "Reorder",
    "inventory.reorder.description":
      "Products at or below their reorder level, with a suggested quantity to bring stock back up.",
    "inventory.reorder.kpi.lowStockCount": "Low-stock count",
    "inventory.reorder.kpi.lowStockCount.sub":
      "Active products at or below reorder level",
    "inventory.reorder.gapChart.title": "Biggest reorder gaps",
    "inventory.reorder.gapChart.description":
      "How far each product's on-hand quantity is below its reorder level.",
    "inventory.reorder.list.title": "Products to reorder",
    "inventory.reorder.list.description": "Click a row to open the product details.",
    "inventory.reorder.list.product": "Product",
    "inventory.reorder.list.category": "Category",
    "inventory.reorder.list.onHand": "On hand",
    "inventory.reorder.list.reorderLevel": "Reorder level",
    "inventory.reorder.list.suggestedQty": "Suggested qty",
    "inventory.reorder.empty":
      "Nothing to reorder — every active product is above its reorder level.",

    // Common
    "inventory.common.actions": "Actions",
    "inventory.common.cancel": "Cancel",
    "inventory.common.close": "Close",
    "inventory.common.save": "Save changes",
    "inventory.common.saving": "Saving…",

    // Enums — category
    "inventory.enums.category.electronics": "Electronics",
    "inventory.enums.category.office": "Office",
    "inventory.enums.category.parts": "Parts",
    "inventory.enums.category.other": "Other",
    // Enums — product status
    "inventory.enums.productStatus.active": "Active",
    "inventory.enums.productStatus.discontinued": "Discontinued",
    // Enums — move type
    "inventory.enums.moveType.in": "In",
    "inventory.enums.moveType.out": "Out",
    "inventory.enums.moveType.adjust": "Adjust",

    // Pickers
    "inventory.pickers.select": "Select...",
    "inventory.pickers.search": "Search...",
    "inventory.pickers.noResults": "No results",
    "inventory.pickers.clear": "Clear selection",
    "inventory.pickers.product.placeholder": "Select a product",
    "inventory.pickers.warehouse.placeholder": "Select a warehouse",

    // Dashboard
    "inventory.dashboard.title": "Inventory",
    "inventory.dashboard.description":
      "On-hand stock across every warehouse, what's running low, and how goods are moving in and out.",
    "inventory.dashboard.kpi.activeProducts": "Active products",
    "inventory.dashboard.kpi.activeProducts.sub": "{{count}} total in catalog",
    "inventory.dashboard.kpi.unitsOnHand": "Units on hand",
    "inventory.dashboard.kpi.unitsOnHand.sub": "Across all warehouses",
    "inventory.dashboard.kpi.stockValue": "Stock value",
    "inventory.dashboard.kpi.stockValue.sub": "On-hand units × unit price",
    "inventory.dashboard.kpi.lowStock": "Low-stock items",
    "inventory.dashboard.kpi.lowStock.sub": "At or below reorder level",
    "inventory.dashboard.stockByProduct.title": "Stock level by product",
    "inventory.dashboard.stockByProduct.description":
      "On-hand units for the best-stocked products. Red bars are at or below reorder level.",
    "inventory.dashboard.lowStock.title": "Low-stock alerts",
    "inventory.dashboard.lowStock.description":
      "Active products at or below their reorder level — reorder these soon.",
    "inventory.dashboard.lowStock.empty":
      "Everything is above its reorder level. Nice.",
    "inventory.dashboard.lowStock.onHand": "{{qty}} on hand",
    "inventory.dashboard.lowStock.reorder": "reorder {{level}}",
    "inventory.dashboard.trend.title": "Stock movement trend",
    "inventory.dashboard.trend.description":
      "Units received vs issued over the last {{weeks}} weeks.",
    "inventory.dashboard.trend.received": "Received",
    "inventory.dashboard.trend.issued": "Issued",

    // Products — fields
    "inventory.products.fields.sku": "SKU",
    "inventory.products.fields.name": "Name",
    "inventory.products.fields.category": "Category",
    "inventory.products.fields.unitPrice": "Unit price",
    "inventory.products.fields.onHand": "On hand",
    "inventory.products.fields.reorderAt": "Reorder at",
    "inventory.products.fields.reorderLevel": "Reorder level",
    "inventory.products.fields.status": "Status",
    "inventory.products.lowFlag": "low",
    // Products — actions / drawers / detail
    "inventory.products.actions.edit": "Edit product",
    "inventory.products.form.create": "Add product",
    "inventory.products.form.sku.placeholder": "e.g. EL-1001",
    "inventory.products.form.name.placeholder": 'e.g. 27" 4K Monitor',
    "inventory.products.validation.sku": "SKU is required",
    "inventory.products.validation.name": "Product name is required",
    "inventory.products.validation.unitPrice": "Price cannot be negative",
    "inventory.products.validation.reorderLevel":
      "Reorder level cannot be negative",
    "inventory.products.drawer.create.title": "New product",
    "inventory.products.drawer.create.description": "Add a product to the catalog.",
    "inventory.products.drawer.edit.title": "Edit product",
    "inventory.products.drawer.edit.description":
      "Update catalog details and reorder level.",
    "inventory.products.drawer.show.description":
      "Catalog details and stock movement history for this product.",
    "inventory.products.detail.profile": "Profile",
    "inventory.products.detail.unnamed": "Unnamed product",
    "inventory.products.detail.loadError.title": "Unable to load product",
    "inventory.products.detail.loadError.description":
      "The product may no longer exist, or you may not have permission to view it.",
    "inventory.products.detail.stockMoves": "Stock moves · {{qty}} on hand",
    "inventory.products.detail.addMove": "Add move",
    "inventory.products.detail.noMoves":
      "No stock moves yet. Record the first receipt or issue.",

    // Warehouses
    "inventory.warehouses.fields.name": "Name",
    "inventory.warehouses.fields.code": "Code",
    "inventory.warehouses.fields.location": "Location",
    "inventory.warehouses.fields.unitsOnHand": "Units on hand",
    "inventory.warehouses.form.create": "Add warehouse",
    "inventory.warehouses.form.name.placeholder":
      "e.g. Central Distribution Center",
    "inventory.warehouses.form.code.placeholder": "e.g. CDC-01",
    "inventory.warehouses.form.location.placeholder": "e.g. Columbus, OH",
    "inventory.warehouses.validation.name": "Warehouse name is required",
    "inventory.warehouses.drawer.create.title": "New warehouse",
    "inventory.warehouses.drawer.create.description": "Add a stocking location.",
    "inventory.warehouses.drawer.edit.title": "Edit warehouse",
    "inventory.warehouses.drawer.edit.description":
      "Update this stocking location.",

    // Stock moves
    "inventory.stockMoves.fields.date": "Date",
    "inventory.stockMoves.fields.product": "Product",
    "inventory.stockMoves.fields.warehouse": "Warehouse",
    "inventory.stockMoves.fields.type": "Type",
    "inventory.stockMoves.fields.qty": "Qty",
    "inventory.stockMoves.fields.quantity": "Quantity",
    "inventory.stockMoves.fields.movedAt": "Moved at",
    "inventory.stockMoves.fields.note": "Note",
    "inventory.stockMoves.actions.edit": "Edit move",
    "inventory.stockMoves.form.create": "Record move",
    "inventory.stockMoves.form.qty.placeholder": "e.g. 24",
    "inventory.stockMoves.form.note.placeholder":
      "Reference, reason, PO number...",
    "inventory.stockMoves.validation.product":
      "Pick the product this move is for",
    "inventory.stockMoves.validation.warehouse": "Pick a warehouse",
    "inventory.stockMoves.validation.qty": "Enter the quantity",
    "inventory.stockMoves.drawer.create.title": "New stock move",
    "inventory.stockMoves.drawer.create.description":
      "Record a receipt, issue or adjustment.",
    "inventory.stockMoves.drawer.edit.title": "Edit stock move",
    "inventory.stockMoves.drawer.edit.description": "Update this movement.",
  },
  "zh-CN": {
    // Nav / resources
    "inventory.resources.dashboard": "库存",
    "inventory.resources.dashboard.description": "在库量、低库存预警与出入库趋势。",
    "inventory.resources.products": "商品",
    "inventory.resources.product": "商品",
    "inventory.resources.products.description": "商品目录,含在库量与补货点。",
    "inventory.resources.warehouses": "仓库",
    "inventory.resources.warehouse": "仓库",
    "inventory.resources.warehouses.description": "各仓储地点及其在库数量。",
    "inventory.resources.stockMoves": "库存流水",
    "inventory.resources.stockMove": "库存流水",
    "inventory.resources.stockMoves.description": "各仓库的入库、出库与调整记录。",
    "inventory.resources.reorder": "补货预警",
    "inventory.resources.reorder.description": "在库量已到或低于补货点的商品,附建议补货数量。",

    // 补货预警页
    "inventory.reorder.title": "补货预警",
    "inventory.reorder.description": "在库量已到或低于补货点的商品,附把库存补回去的建议数量。",
    "inventory.reorder.kpi.lowStockCount": "低库存商品数",
    "inventory.reorder.kpi.lowStockCount.sub": "在售商品中已到或低于补货点的数量",
    "inventory.reorder.gapChart.title": "补货缺口最大的商品",
    "inventory.reorder.gapChart.description": "各商品在库量低于补货点的差值。",
    "inventory.reorder.list.title": "待补货商品",
    "inventory.reorder.list.description": "点击一行可查看商品详情。",
    "inventory.reorder.list.product": "商品",
    "inventory.reorder.list.category": "分类",
    "inventory.reorder.list.onHand": "在库量",
    "inventory.reorder.list.reorderLevel": "补货点",
    "inventory.reorder.list.suggestedQty": "建议补货量",
    "inventory.reorder.empty": "暂无需要补货的商品,所有在售商品都高于补货点。",

    // Common
    "inventory.common.actions": "操作",
    "inventory.common.cancel": "取消",
    "inventory.common.close": "关闭",
    "inventory.common.save": "保存修改",
    "inventory.common.saving": "保存中…",

    // Enums — category
    "inventory.enums.category.electronics": "电子产品",
    "inventory.enums.category.office": "办公用品",
    "inventory.enums.category.parts": "零配件",
    "inventory.enums.category.other": "其他",
    // Enums — product status
    "inventory.enums.productStatus.active": "在售",
    "inventory.enums.productStatus.discontinued": "已停售",
    // Enums — move type
    "inventory.enums.moveType.in": "入库",
    "inventory.enums.moveType.out": "出库",
    "inventory.enums.moveType.adjust": "调整",

    // Pickers
    "inventory.pickers.select": "请选择…",
    "inventory.pickers.search": "搜索…",
    "inventory.pickers.noResults": "无结果",
    "inventory.pickers.clear": "清除选择",
    "inventory.pickers.product.placeholder": "选择商品",
    "inventory.pickers.warehouse.placeholder": "选择仓库",

    // Dashboard
    "inventory.dashboard.title": "库存",
    "inventory.dashboard.description":
      "各仓库的在库量、哪些商品即将短缺,以及货物的出入库情况。",
    "inventory.dashboard.kpi.activeProducts": "在售商品",
    "inventory.dashboard.kpi.activeProducts.sub": "目录中共 {{count}} 个",
    "inventory.dashboard.kpi.unitsOnHand": "在库数量",
    "inventory.dashboard.kpi.unitsOnHand.sub": "全部仓库合计",
    "inventory.dashboard.kpi.stockValue": "库存价值",
    "inventory.dashboard.kpi.stockValue.sub": "在库数量 × 单价",
    "inventory.dashboard.kpi.lowStock": "低库存商品",
    "inventory.dashboard.kpi.lowStock.sub": "达到或低于补货点",
    "inventory.dashboard.stockByProduct.title": "各商品库存水平",
    "inventory.dashboard.stockByProduct.description":
      "库存最充足商品的在库数量。红色柱表示达到或低于补货点。",
    "inventory.dashboard.lowStock.title": "低库存预警",
    "inventory.dashboard.lowStock.description":
      "达到或低于补货点的在售商品——请尽快补货。",
    "inventory.dashboard.lowStock.empty": "所有商品都高于补货点,一切正常。",
    "inventory.dashboard.lowStock.onHand": "在库 {{qty}}",
    "inventory.dashboard.lowStock.reorder": "补货点 {{level}}",
    "inventory.dashboard.trend.title": "出入库趋势",
    "inventory.dashboard.trend.description": "过去 {{weeks}} 周的入库与出库数量对比。",
    "inventory.dashboard.trend.received": "入库",
    "inventory.dashboard.trend.issued": "出库",

    // Products — fields
    "inventory.products.fields.sku": "SKU",
    "inventory.products.fields.name": "名称",
    "inventory.products.fields.category": "分类",
    "inventory.products.fields.unitPrice": "单价",
    "inventory.products.fields.onHand": "在库量",
    "inventory.products.fields.reorderAt": "补货点",
    "inventory.products.fields.reorderLevel": "补货点",
    "inventory.products.fields.status": "状态",
    "inventory.products.lowFlag": "偏低",
    // Products — actions / drawers / detail
    "inventory.products.actions.edit": "编辑商品",
    "inventory.products.form.create": "新增商品",
    "inventory.products.form.sku.placeholder": "例如 EL-1001",
    "inventory.products.form.name.placeholder": "例如 27 寸 4K 显示器",
    "inventory.products.validation.sku": "请填写 SKU",
    "inventory.products.validation.name": "请填写商品名称",
    "inventory.products.validation.unitPrice": "单价不能为负",
    "inventory.products.validation.reorderLevel": "补货点不能为负",
    "inventory.products.drawer.create.title": "新增商品",
    "inventory.products.drawer.create.description": "向目录中添加一个商品。",
    "inventory.products.drawer.edit.title": "编辑商品",
    "inventory.products.drawer.edit.description": "更新目录信息与补货点。",
    "inventory.products.drawer.show.description": "该商品的目录信息与库存流水记录。",
    "inventory.products.detail.profile": "基本信息",
    "inventory.products.detail.unnamed": "未命名商品",
    "inventory.products.detail.loadError.title": "无法加载商品",
    "inventory.products.detail.loadError.description":
      "该商品可能已不存在,或你没有查看权限。",
    "inventory.products.detail.stockMoves": "库存流水 · 在库 {{qty}}",
    "inventory.products.detail.addMove": "新增流水",
    "inventory.products.detail.noMoves": "暂无库存流水。记录第一笔入库或出库吧。",

    // Warehouses
    "inventory.warehouses.fields.name": "名称",
    "inventory.warehouses.fields.code": "编码",
    "inventory.warehouses.fields.location": "地点",
    "inventory.warehouses.fields.unitsOnHand": "在库数量",
    "inventory.warehouses.form.create": "新增仓库",
    "inventory.warehouses.form.name.placeholder": "例如 中央配送中心",
    "inventory.warehouses.form.code.placeholder": "例如 CDC-01",
    "inventory.warehouses.form.location.placeholder": "例如 上海市浦东新区",
    "inventory.warehouses.validation.name": "请填写仓库名称",
    "inventory.warehouses.drawer.create.title": "新增仓库",
    "inventory.warehouses.drawer.create.description": "添加一个仓储地点。",
    "inventory.warehouses.drawer.edit.title": "编辑仓库",
    "inventory.warehouses.drawer.edit.description": "更新该仓储地点。",

    // Stock moves
    "inventory.stockMoves.fields.date": "日期",
    "inventory.stockMoves.fields.product": "商品",
    "inventory.stockMoves.fields.warehouse": "仓库",
    "inventory.stockMoves.fields.type": "类型",
    "inventory.stockMoves.fields.qty": "数量",
    "inventory.stockMoves.fields.quantity": "数量",
    "inventory.stockMoves.fields.movedAt": "发生时间",
    "inventory.stockMoves.fields.note": "备注",
    "inventory.stockMoves.actions.edit": "编辑流水",
    "inventory.stockMoves.form.create": "记录流水",
    "inventory.stockMoves.form.qty.placeholder": "例如 24",
    "inventory.stockMoves.form.note.placeholder": "单据号、原因、采购单号……",
    "inventory.stockMoves.validation.product": "请选择本次流水对应的商品",
    "inventory.stockMoves.validation.warehouse": "请选择仓库",
    "inventory.stockMoves.validation.qty": "请填写数量",
    "inventory.stockMoves.drawer.create.title": "新增库存流水",
    "inventory.stockMoves.drawer.create.description": "记录一笔入库、出库或调整。",
    "inventory.stockMoves.drawer.edit.title": "编辑库存流水",
    "inventory.stockMoves.drawer.edit.description": "更新这笔流水。",
  },
};
