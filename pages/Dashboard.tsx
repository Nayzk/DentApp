
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Product, Customer, Supplier, Sale } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { initialProducts, initialCustomers, initialSuppliers } from '../data/initialData';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement }> = ({ title, value, icon }) => (
  <div className="bg-gray-900 p-6 rounded-lg shadow-md flex items-center justify-between transition-shadow hover:shadow-lg">
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-100">{value}</p>
    </div>
    <div className="bg-sky-900 bg-opacity-50 text-sky-400 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const salesData = [
  { name: 'يناير', sales: 4000 }, { name: 'فبراير', sales: 3000 }, { name: 'مارس', sales: 5000 },
  { name: 'أبريل', sales: 4500 }, { name: 'مايو', sales: 6000 }, { name: 'يونيو', sales: 5500 },
];

export const Dashboard: React.FC = () => {
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [customers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [suppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  const [sales] = useLocalStorage<Sale[]>('sales', []);
  
  const lowStockProducts = products.filter(p => p.stock < 10);
  const recentSales = sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="إجمالي المنتجات" value={products.length} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>} />
          <StatCard title="إجمالي العملاء" value={customers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>} />
          <StatCard title="إجمالي الموردين" value={suppliers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>} />
          <StatCard title="منتجات قاربت على النفاد" value={lowStockProducts.length} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>} />
        </div>
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">أداء المبيعات (بيانات تجريبية)</h3>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                  <XAxis dataKey="name" stroke="#A0AEC0" />
                  <YAxis stroke="#A0AEC0" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4A5568' }} itemStyle={{ color: '#A0AEC0' }} />
                  <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                  <Bar dataKey="sales" fill="#0ea5e9" name="المبيعات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
      {/* Side Column */}
      <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">الأنشطة الأخيرة</h3>
              <div className="space-y-4">
                  {recentSales.length > 0 ? recentSales.map(sale => (
                      <div key={sale.id} className="flex justify-between items-center">
                          <div>
                              <p className="font-semibold text-gray-200">{sale.customerName}</p>
                              <p className="text-sm text-gray-400">{sale.invoiceNumber}</p>
                          </div>
                          <p className="font-bold text-sky-400">{sale.total.toFixed(2)} ج.م</p>
                      </div>
                  )) : <p className="text-gray-400">لا توجد مبيعات حديثة.</p>}
              </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">أصناف على وشك النفاد</h3>
               <div className="space-y-3">
                  {lowStockProducts.length > 0 ? lowStockProducts.map(product => (
                      <div key={product.id} className="flex justify-between items-center">
                          <p className="font-medium text-gray-200">{product.name}</p>
                          <span className={`px-2 py-1 text-xs font-bold bg-red-900 text-red-200 rounded-full`}>{product.stock}</span>
                      </div>
                  )) : <p className="text-gray-400">لا توجد أصناف قليلة المخزون.</p>}
              </div>
          </div>
      </div>
    </div>
  );
};