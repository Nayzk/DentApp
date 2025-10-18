
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Sale, Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';

const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-gray-900 p-6 rounded-lg shadow-md flex-1">
    <p className="text-sm font-medium text-gray-400">{title}</p>
    <p className="text-3xl font-bold text-gray-100">{value}</p>
  </div>
);

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const Reports: React.FC = () => {
  const [sales] = useLocalStorage<Sale[]>('sales', []);
  const [orders] = useLocalStorage<Order[]>('orders', []);
  const [currentYear] = useState(new Date().getFullYear());

  // State for detailed sales report
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());

  const { monthlyData, totals } = useMemo(() => {
    let totalSales = 0;
    let totalPurchases = 0;
    const salesMonthlyAgg = new Map<string, number>();
    const purchasesMonthlyAgg = new Map<string, number>();

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === currentYear) {
        totalSales += sale.total;
        const monthKey = `${saleDate.getMonth()}`;
        salesMonthlyAgg.set(monthKey, (salesMonthlyAgg.get(monthKey) || 0) + sale.total);
      }
    });

    orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (order.status === 'completed' && orderDate.getFullYear() === currentYear) {
        totalPurchases += order.total;
        const monthKey = `${orderDate.getMonth()}`;
        purchasesMonthlyAgg.set(monthKey, (purchasesMonthlyAgg.get(monthKey) || 0) + order.total);
      }
    });
    
    const combinedMonthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('ar-EG', { month: 'short' }),
      sales: salesMonthlyAgg.get(String(i)) || 0,
      purchases: purchasesMonthlyAgg.get(String(i)) || 0,
    }));

    return { monthlyData: combinedMonthlyData, totals: { totalSales, totalPurchases, netProfit: totalSales - totalPurchases }};
  }, [sales, orders, currentYear]);

  const detailedReportData = useMemo(() => {
    if (!startDate || !endDate) return { topProducts: [], salesByCustomer: [] };

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });

    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.quantity * item.price;
        productSales.set(item.productId, current);
      });
    });

    const customerSales = new Map<string, { name: string; total: number }>();
    filteredSales.forEach(sale => {
      const current = customerSales.get(sale.customerId) || { name: sale.customerName, total: 0 };
      current.total += sale.total;
      customerSales.set(sale.customerId, current);
    });

    return {
      topProducts: Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue),
      salesByCustomer: Array.from(customerSales.values()).sort((a, b) => b.total - a.total),
    };
  }, [sales, startDate, endDate]);
  
  const handleExportReport = () => {
    if (detailedReportData.topProducts.length > 0) {
      downloadCsv(jsonToCsv(detailedReportData.topProducts), createExportFilename(`top-products-report-${startDate}-to-${endDate}`));
    }
     if (detailedReportData.salesByCustomer.length > 0) {
      downloadCsv(jsonToCsv(detailedReportData.salesByCustomer), createExportFilename(`sales-by-customer-report-${startDate}-to-${endDate}`));
    }
    if(detailedReportData.topProducts.length === 0 && detailedReportData.salesByCustomer.length === 0){
        alert("لا توجد بيانات لتصديرها في النطاق الزمني المحدد.")
    }
  };

  return (
    <div className="space-y-8">
      <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-4">ملخص الأداء المالي ({currentYear})</h2>
          <div className="flex flex-wrap gap-6">
            <StatCard title="إجمالي المبيعات" value={`${totals.totalSales.toFixed(2)} ج.م`} />
            <StatCard title="إجمالي المشتريات" value={`${totals.totalPurchases.toFixed(2)} ج.م`} />
            <StatCard title="صافي الربح" value={`${totals.netProfit.toFixed(2)} ج.م`} />
          </div>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">مقارنة المبيعات والمشتريات الشهرية ({currentYear})</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568"/>
                <XAxis dataKey="name" stroke="#A0AEC0"/>
                <YAxis stroke="#A0AEC0" tickFormatter={(value) => `${value / 1000}k`}/>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ج.م`} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4A5568' }} itemStyle={{ color: '#A0AEC0' }}/>
                <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                <Bar dataKey="sales" fill="#0ea5e9" name="المبيعات" />
                <Bar dataKey="purchases" fill="#f59e0b" name="المشتريات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
           <h3 className="text-xl font-semibold text-gray-100">تقرير المبيعات المفصل</h3>
           <button onClick={handleExportReport} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 shadow-sm transition-colors">
              تصدير التقرير
            </button>
        </div>
        <div className="flex gap-4 items-center mb-6 p-4 bg-gray-800 rounded-lg">
            <label className="text-gray-300 font-medium">من تاريخ:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md"/>
            <label className="text-gray-300 font-medium">إلى تاريخ:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-3">أفضل الأصناف مبيعاً</h4>
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-right">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold text-gray-300">الصنف</th>
                                <th className="p-3 font-semibold text-gray-300">الكمية المباعة</th>
                                <th className="p-3 font-semibold text-gray-300">إجمالي الإيرادات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedReportData.topProducts.map(p => (
                                <tr key={p.name} className="border-b border-gray-700">
                                    <td className="p-3 text-gray-200">{p.name}</td>
                                    <td className="p-3 text-gray-300">{p.quantity}</td>
                                    <td className="p-3 text-gray-300">{p.revenue.toFixed(2)} ج.م</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {detailedReportData.topProducts.length === 0 && <p className="text-center py-6 text-gray-400">لا توجد بيانات.</p>}
                </div>
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-3">المبيعات حسب العميل</h4>
                 <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-right">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold text-gray-300">العميل</th>
                                <th className="p-3 font-semibold text-gray-300">إجمالي المبيعات</th>
                            </tr>
                        </thead>
                        <tbody>
                             {detailedReportData.salesByCustomer.map(c => (
                                <tr key={c.name} className="border-b border-gray-700">
                                    <td className="p-3 text-gray-200">{c.name}</td>
                                    <td className="p-3 text-gray-300">{c.total.toFixed(2)} ج.م</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {detailedReportData.salesByCustomer.length === 0 && <p className="text-center py-6 text-gray-400">لا توجد بيانات.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};