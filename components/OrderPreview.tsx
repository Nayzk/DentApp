
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
           <div className="flex items-center gap-3 mb-2">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-900">الأسنانجي</h1>
          </div>
          <p className="text-gray-600">شركة مستلزمات طب الأسنان</p>
          <p className="text-gray-600">123 شارع وهمي, القاهرة, مصر</p>
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