// Fix: Implementing the OrderPreview component which was previously a placeholder file.
import React from 'react';
import type { Order } from '../types';
import { Logo } from './Logo';

interface OrderPreviewProps {
  order: Order;
  onClose: () => void;
}

export const OrderPreview: React.FC<OrderPreviewProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-gray-800 p-8 rounded-lg max-w-4xl mx-auto printable-area" dir="rtl">
      <div className="flex justify-between items-start mb-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-900">الأسنانجي</h1>
          </div>
          <div className="space-y-1 text-gray-600 text-sm">
              <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>مركز دير مواس، المنيا، مصر</span>
              </p>
              <p className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span dir="ltr">01009855113</span>
              </p>
              <p className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span>moh.ali541983@gmail.com</span>
              </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-gray-900">أمر شراء</h2>
          <p className="text-gray-600">رقم الطلب: {order.orderNumber}</p>
          <p className="text-gray-600">التاريخ: {new Date(order.date).toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-700 mb-2">إلى المورد:</h3>
        <p className="font-semibold text-gray-800">{order.supplierName}</p>
      </div>

      <table className="w-full text-right mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 font-semibold text-gray-700">#</th>
            <th className="p-3 font-semibold text-gray-700">الصنف</th>
            <th className="p-3 font-semibold text-gray-700">الكمية</th>
            <th className="p-3 font-semibold text-gray-700">سعر الشراء</th>
            <th className="p-3 font-semibold text-gray-700">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={item.productId} className="border-b border-gray-200">
              <td className="p-3 text-gray-800">{index + 1}</td>
              <td className="p-3 font-medium text-gray-800">{item.productName}</td>
              <td className="p-3 text-gray-800">{item.quantity}</td>
              <td className="p-3 text-gray-800">{item.price.toFixed(2)} ج.م</td>
              <td className="p-3 text-gray-800">{item.total.toFixed(2)} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-full max-w-xs text-right">
          <hr className="my-2 border-gray-300" />
          <div className="flex justify-between font-bold text-xl">
            <span className="text-black">الإجمالي:</span>
            <span className="text-black">{order.total.toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>
      
       {order.notes && (
          <div className="mt-8 pt-4 border-t border-gray-200">
              <h4 className="font-bold text-gray-700 mb-1">ملاحظات:</h4>
              <p className="text-gray-600">{order.notes}</p>
          </div>
      )}

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