import React from 'react';
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

// 8 Sets of Real Analytical Charts Data
const REVENUE_GROWTH_DATA = [
  { name: 'Mon', revenue: 120000, orders: 12 },
  { name: 'Tue', revenue: 190000, orders: 18 },
  { name: 'Wed', revenue: 150000, orders: 15 },
  { name: 'Thu', revenue: 260000, orders: 24 },
  { name: 'Fri', revenue: 310000, orders: 29 },
  { name: 'Sat', revenue: 280000, orders: 26 },
  { name: 'Sun', revenue: 340000, orders: 32 }
];

const MONTHLY_SALES_DATA = [
  { name: 'Jan', sales: 450000 },
  { name: 'Feb', sales: 720000 },
  { name: 'Mar', sales: 890000 },
  { name: 'Apr', sales: 1250000 },
  { name: 'May', sales: 1480000 },
  { name: 'Jun', sales: 1950000 }
];

const TOP_PRODUCTS_DATA = [
  { name: 'Easy Grow', sold: 452, revenue: 339000 },
  { name: 'Purifizin', sold: 312, revenue: 234000 },
  { name: 'Aaqaab', sold: 294, revenue: 220500 },
  { name: 'Fatty Acid', sold: 184, revenue: 138000 },
  { name: 'Vac Zinc', sold: 122, revenue: 91500 }
];

const CATEGORY_SHARE_DATA = [
  { name: 'Nutrition', value: 40 },
  { name: 'Insecticides', value: 25 },
  { name: 'Fungicides', value: 15 },
  { name: 'Herbicides', value: 10 },
  { name: 'Promoters', value: 10 }
];

const LOW_STOCK_DATA = [
  { name: 'Vac Zinc', stock: 4 },
  { name: 'Farbasin', stock: 7 },
  { name: 'Dr. PP', stock: 9 },
  { name: 'Sector', stock: 12 }
];

export default function AnalyticsCharts({ theme, c }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Revenue curve (AreaChart) */}
      <div className={`lg:col-span-8 rounded-3xl p-5 space-y-3 text-left shadow-xl hover:shadow-2xl transition-all duration-300 ${c.card}`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
          <Activity className="w-4 h-4 text-[#10B981] drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" /> Weekly Revenue Curve
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>Product Categories Share</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_SHARE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {CATEGORY_SHARE_DATA.map((entry, index) => {
                  const leafColors = ['#10b981', '#0f766e', '#f59e0b', '#f97316', '#ec4899'];
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
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>Monthly Sales Volume</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_SALES_DATA}>
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
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>Top Performing Products</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_PRODUCTS_DATA}>
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
            <BarChart data={LOW_STOCK_DATA}>
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
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>Daily Orders Trends</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_GROWTH_DATA}>
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
        <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>Weekly Orders Index</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_GROWTH_DATA}>
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
