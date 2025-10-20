distribution-system/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── products/
│   │   │   ├── page.js
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── stores/
│   │   │   ├── page.js
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── orders/
│   │   │   ├── page.js
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   └── payments/
│   │       ├── page.js
│   │       └── [id]/
│   │           └── page.js
│   ├── api/
│   │   ├── products/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   ├── stores/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   ├── orders/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   └── payments/
│   │       ├── route.js
│   │       └── [id]/
│   │           └── route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Input.js
│   │   └── Table.js
│   ├── layout/
│   │   ├── Sidebar.js
│   │   ├── Navbar.js
│   │   └── DashboardLayout.js
│   ├── dashboard/
│   │   ├── StatsCards.js
│   │   ├── SalesChart.js
│   │   ├── RecentOrders.js
│   │   └── QuickOrder.js
│   ├── stores/
│   │   ├── StoreMap.js
│   │   ├── StoreList.js
│   │   └── StoreForm.js
│   ├── products/
│   │   ├── ProductList.js
│   │   ├── ProductForm.js
│   │   └── ProductCard.js
│   ├── orders/
│   │   ├── OrderList.js
│   │   ├── OrderForm.js
│   │   └── OrderDetails.js
│   └── payments/
│       ├── PaymentList.js
│       └── PaymentForm.js
├── lib/
│   ├── database.js
│   ├── utils.js
│   ├── actions.js
│   └── validations.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
│   ├── images/
│   │   └── products/
│   └── icons/
├── middleware.js
└── package.json