// Fix: Implementing the InvoicePreview component which was previously a placeholder file.
import React from 'react';
import type { Sale } from '../types';
import { Logo } from './Logo';

interface InvoicePreviewProps {
  sale: Sale;
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-gray-800 p-8 rounded-lg max-w-4xl mx-auto printable-area" dir="rtl">
      <header className="flex justify-between items-center pb-6 border-b-2 border-gray-200">
         <div>
           <div className="flex items-center gap-3 mb-2">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-900">الأسنانجي</h1>
          </div>
          <p className="text-gray-600">شركة مستلزمات طب الأسنان</p>
          <p className="text-gray-600">العنوان: مركز دير مواس، المنيا، مصر</p>
          <p className="text-gray-600">الهاتف: 01009855113</p>
          <p className="text-gray-600">البريد الإلكتروني: moh.ali541983@gmail.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-sky-600 tracking-wider">فاتورة</h2>
          <p className="text-gray-600 mt-2">رقم: {sale.invoiceNumber}</p>
          <p className="text-gray-600">التاريخ: {new Date(sale.date).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
        </div>
      </header>

      <section className="my-8 grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold text-gray-600 mb-2">فاتورة إلى:</h3>
          <p className="font-semibold text-gray-900 text-lg">{sale.customerName}</p>
          {/* Add more customer details here if available */}
        </div>
      </section>

      <table className="w-full text-right mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 font-bold text-gray-600 text-sm uppercase tracking-wider">#</th>
            <th className="p-3 font-bold text-gray-600 text-sm uppercase tracking-wider">الصنف</th>
            <th className="p-3 font-bold text-gray-600 text-sm uppercase tracking-wider">الكمية</th>
            <th className="p-3 font-bold text-gray-600 text-sm uppercase tracking-wider">سعر الوحدة</th>
            <th className="p-3 font-bold text-gray-600 text-sm uppercase tracking-wider text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={item.productId} className="border-b border-gray-200">
              <td className="p-3 text-gray-700">{index + 1}</td>
              <td className="p-3 font-medium text-gray-800">{item.productName}</td>
              <td className="p-3 text-gray-700">{item.quantity}</td>
              <td className="p-3 text-gray-700">{item.price.toFixed(2)} ج.م</td>
              <td className="p-3 text-gray-800 text-left font-semibold">{item.total.toFixed(2)} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-full max-w-sm text-right space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">المجموع الفرعي:</span>
            <span className="font-semibold text-gray-800">{sale.subtotal.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">الخصم:</span>
            <span className="font-semibold text-gray-800">{sale.discount.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between font-bold text-xl p-3 bg-gray-100 rounded-lg">
            <span className="text-gray-900">الإجمالي:</span>
            <span className="text-sky-600">{sale.total.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>
      
      {sale.notes && (
          <div className="mt-8 pt-4 border-t border-gray-200">
              <h4 className="font-bold text-gray-600 mb-1">ملاحظات:</h4>
              <p className="text-gray-700 italic">{sale.notes}</p>
          </div>
      )}

      <footer className="mt-12 text-center text-gray-500 text-sm no-print">
        <p>شكرًا لتعاملكم معنا!</p>
        <p>إذا كان لديك أي أسئلة بخصوص هذه الفاتورة, يرجى التواصل معنا.</p>
      </footer>

      <div className="flex justify-end gap-4 pt-8 no-print">
        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">إغلاق</button>
        <button type="button" onClick={handlePrint} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">طباعة</button>
      </div>

       <style>{`
        @media print {
          .no-print { display: none; }
          body {
            background-color: #fff;
          }
          .printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: auto;
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            padding: 20px;
          }
           body * {
             visibility: hidden;
           }
          .printable-area, .printable-area * {
             visibility: visible;
           }
        }
      `}</style>
    </div>
  );
};