export const inventoryRoutes = {
  dashboard: "/inventory",
  products: "/products",
  productsCreate: "/products/create",
  productsEdit: "/products/edit/:id",
  productsShow: "/products/show/:id",
  warehouses: "/warehouses",
  warehousesCreate: "/warehouses/create",
  warehousesEdit: "/warehouses/edit/:id",
  stockMoves: "/stock-moves",
  stockMovesCreate: "/stock-moves/create",
  stockMovesEdit: "/stock-moves/edit/:id",
} as const;
