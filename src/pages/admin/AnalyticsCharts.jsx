import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Activity } from 'lucide-react';

// Fallback static data
const STATIC_REVENUE = [
  { name: 'Mon', revenue: 120000, orders: 12 },
  { name: 'Tue', revenue: 190000, orders: 18 },
  { name: 'Wed', revenue: 150000, orders: 15 },
  { name: 'Thu', revenue: 260000, orders: 24 },
  { name: 'Fri', revenue: 310000, orders: 29 },
  { name: 'Sat', revenue: 280000, orders: 26 },
  { name: 'Sun', revenue: 340000, orders: 32 }
];

const STATIC_MONTHLY = [
  { name: 'Jan', sales: 450000 },
  { name: 'Feb', sales: 720000 },
  { name: 'Mar', sales: 890000 },
  { name: 'Apr', sales: 1250000 },
  { name: 'May', sales: 1480000 },
  { name: 'Jun', sales: 1950000 }
];

const CATEGORY_LABELS = {
  plant_nutrition: 'Nutrition',
  insecticide: 'Insecticides',
  fungicide: 'Fungicides',
  herbicide: 'Herbicides',
  growth_promoter: 'Promoters',
  soil_conditioner: 'Conditioners'
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AnalyticsCharts({ theme, c, orders = [], dbProducts = [] }) {
  // Derive weekly revenue + order counts from live orders
  const revenueData = useMemo(() => {
    if (!orders || orders.length === 0) return STATIC_REVENUE;
    const dayMap = {};
    DAYS.forEach(d => { dayMap[d] = { name: d, revenue: 0, orders: 0 }; });
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    orders.forEach(o => {
      const d = new Date(o.createdAt || o.created_at);
      if (d >= weekAgo) {
        const day = DAYS[d.getDay()];
        dayMap[day].orders += 1;
        dayMap[day].revenue += (o.grandTotal || o.total || o.totalAmount || 0);
      }
    });
    const result = DAYS.slice(1).concat(DAYS[0]).map(d => dayMap[d]);
    const hasData = result.some(r => r.orders > 0);
    return hasData ? result : STATIC_REVENUE;
  }, [orders]);

  // Derive monthly sales from live orders
  const monthlySalesData = useMemo(() => {
    if (!orders || orders.length === 0) return STATIC_MONTHLY;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap = {};
    MONTHS.forEach(m => { monthMap[m] = 0; });
    orders.forEach(o => {
      if (o.status === 'delivered' || o.status === 'confirmed' || o.status === 'processing') {
        const d = new Date(o.createdAt || o.created_at);
        const m = MONTHS[d.getMonth()];
        monthMap[m] += (o.grandTotal || o.total || o.totalAmount || 0);
      }
    });
    const result = MONTHS.filter(m => monthMap[m] > 0).map(m => ({ name: m, sales: monthMap[m] }));
    return result.length >= 2 ? result : STATIC_MONTHLY;
  }, [orders]);

  // Derive category share from live products
  const categoryShareData = useMemo(() => {
    if (!dbProducts || dbProducts.length === 0) {
      return [
        { name: 'Nutrition', value: 40 },
        { name: 'Insecticides', value: 25 },
        { name: 'Fungicides', value: 15 },
        { name: 'Herbicides', value: 10 },
        { name: 'Promoters', value: 10 }
      ];
    }
    const catCount = {};
    dbProducts.forEach(p => {
      const cat = p.productCategory || p.category || 'other';
      const label = CATEGORY_LABELS[cat] || cat;
      catCount[label] = (catCount[label] || 0) + 1;
    });
    const total = dbProducts.length;
    return Object.entries(catCount).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100)
    }));
  }, [dbProducts]);

  // Top products by sold units (from orders line items or single order payloads) or static
  const topProductsData = useMemo(() => {
    const fallback = [
      { name: 'Easy Grow', sold: 452, revenue: 339000 },
      { name: 'Purifizin', sold: 312, revenue: 234000 },
      { name: 'Aaqaab', sold: 294, revenue: 220500 },
      { name: 'Fatty Acid', sold: 184, revenue: 138000 },
      { name: 'Vac Zinc', sold: 122, revenue: 91500 }
    ];
    if (!orders || orders.length === 0) return fallback;
    const productSales = {};
    orders.forEach(o => {
      if (o.status === 'delivered' || o.status === 'confirmed' || o.status === 'processing') {
        const items = o.items || o.products || [];
        if (items.length > 0) {
          items.forEach(item => {
            const pName = item.name || item.productName || 'Unknown';
            if (!productSales[pName]) productSales[pName] = { sold: 0, revenue: 0 };
            productSales[pName].sold += (item.quantity || 1);
            productSales[pName].revenue += (item.price || 0) * (item.quantity || 1);
          });
        } else if (o.productName) {
          const pName = o.productName;
          if (!productSales[pName]) productSales[pName] = { sold: 0, revenue: 0 };
          productSales[pName].sold += (o.quantity || 1);
          productSales[pName].revenue += (o.grandTotal || o.total || o.totalAmount || 0);
        }
      }
    });
    const result = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
    return result.length >= 2 ? result : fallback;
  }, [orders]);

  // Low stock from live products
  const lowStockData = useMemo(() => {
    const fallback = [
      { name: 'Vac Zinc', stock: 4 },
      { name: 'Farbasin', stock: 7 },
      { name: 'Dr. PP', stock: 9 },
      { name: 'Sector', stock: 12 }
    ];
    if (!dbProducts || dbProducts.length === 0) return fallback;
    const lowItems = dbProducts
      .filter(p => (p.stockInventory || 0) < 15 && (p.stockInventory || 0) >= 0)
      .map(p => ({ name: p.productName || p.name?.en || p.id, stock: p.stockInventory || 0 }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);
    return lowItems.length >= 1 ? lowItems : fallback;
  }, [dbProducts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Revenue curve (AreaChart) */}
      <div className={`lg:col-span-8 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>
          <Activity className="w-4 h-4 text-[#10B981] drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" /> Weekly Revenue Curve
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} fontMono className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} fontMono className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={{ r: 3.5, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Product Categories share (PieChart) */}
      <div className={`lg:col-span-4 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Product Categories Share</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryShareData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryShareData.map((entry, index) => {
                  const leafColors = ['#10b981', '#0f766e', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6'];
                  return <Cell key={`cell-${index}`} fill={leafColors[index % leafColors.length]} />;
                })}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Sales Volume (BarChart) */}
      <div className={`lg:col-span-4 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Monthly Sales Volume</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySalesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Bar dataKey="sales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Top Selling Products (BarChart) */}
      <div className={`lg:col-span-4 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Top Performing Products</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData}>
              <defs>
                <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Bar dataKey="sold" fill="url(#colorSold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Inventory Low Stock Alerts (BarChart) */}
      <div className={`lg:col-span-4 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-red-400">Critical Low Stock Level</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lowStockData}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#9f1239" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Bar dataKey="stock" fill="url(#colorCritical)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Daily Orders (AreaChart) */}
      <div className={`lg:col-span-6 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Daily Orders Trends</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Area type="monotone" dataKey="orders" stroke="#f59e0b" fill="url(#colorOrders)" fillOpacity={1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Weekly Orders Breakdown */}
      <div className={`lg:col-span-6 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-emerald-950'}`}>Weekly Orders Index</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <defs>
                <linearGradient id="colorWeeklyOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
              <XAxis dataKey="name" stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <YAxis stroke="rgba(16, 185, 129, 0.25)" fontSize={9} className="font-mono text-[9px]" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(6, 11, 7, 0.95)', borderColor: 'rgba(16, 185, 129, 0.25)', borderRadius: '16px', fontSize: 10, color: '#fff', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }} />
              <Bar dataKey="orders" fill="url(#colorWeeklyOrders)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AnalyticsCharts);
