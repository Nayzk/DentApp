
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { SalesOrder, Sale, Product, User } from '../types';
import { Modal } from '../components/Modal';
import { SalesOrderForm } from '../components/SalesOrderForm';
import { SalesOrderPreview } from '../components/SalesOrderPreview';
import { EmptyState } from '../components/EmptyState';

interface SalesOrdersProps {
    currentUser: User;
}

export const SalesOrders: React.FC<SalesOrdersProps> = ({ currentUser }) => {
  const [salesOrders, setSalesOrders] = useLocalStorage<SalesOrder[]>('sales-orders', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [, setProducts] = useLocalStorage<Product[]>('products', []);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<SalesOrder | null>(null);
  const [orderToPreview, setOrderToPreview] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = currentUser.role === 'admin';

  const filteredOrders = useMemo(() => {
    return salesOrders
      .filter(o => 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [salesOrders, searchTerm]);

  const handleOpenFormModal = (order?: SalesOrder) => {
    setOrderToEdit(order || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setOrderToEdit(null);
    setIsFormModalOpen(false);
  };
  
  const handleOpenPreviewModal = (order: SalesOrder) => {
    setOrderToPreview(order);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setOrderToPreview(null);
    setIsPreviewModalOpen(false);
  };
  
  const handleSaveOrder = (order: SalesOrder) => {
    if (orderToEdit) {
      setSalesOrders(salesOrders.map(o => o.id === order.id ? order : o));
    } else {
      setSalesOrders([order, ...salesOrders]);
    }
    handleCloseFormModal();
  };
  
  const handleUpdateStatus = (orderId: string, status: SalesOrder['status']) => {
    if (status === 'cancelled' && !window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    setSalesOrders(salesOrders.map(o => o.id === orderId ? { ...o, status } : o));
  };
  
  const handleConvertToInvoice = (order: SalesOrder) => {
    if (order.status !== 'pending') {
        alert('يمكن تحويل الطلبات قيد الانتظار فقط.');
        return;
    }

    if (!window.confirm('هل تريد تحويل طلب البيع هذا إلى فاتورة؟ سيتم تحديث المخزون.')) return;

    // Read all relevant data from localStorage at the start of the transaction
    // to ensure consistency and avoid stale state.
    const currentProducts: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
    const currentSales: Sale[] = JSON.parse(localStorage.getItem('sales') || '[]');
    const currentSalesOrders: SalesOrder[] = JSON.parse(localStorage.getItem('sales-orders') || '[]');
    
    let stockError = false;
    order.items.forEach(item => {
        const product = currentProducts.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            alert(`المخزون غير كافٍ لصنف: ${item.productName}. المتوفر: ${product?.stock || 0}. لا يمكن إنشاء الفاتورة.`);
            stockError = true;
        }
    });

    if (stockError) return;
    
    const getNextInvoiceNumber = () => {
        const highestNumber = currentSales
            .map(s => {
                const match = s.invoiceNumber.match(/^INV-(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);
        
        return `INV-${(highestNumber + 1).toString().padStart(4, '0')}`;
    };

    const newSale: Sale = {
        id: crypto.randomUUID(),
        invoiceNumber: getNextInvoiceNumber(),
        date: new Date().toISOString(),
        customerId: order.customerId,
        customerName: order.customerName,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        notes: `تم إنشاؤها من طلب البيع: ${order.orderNumber}`,
    };

    const updatedProducts = [...currentProducts];
    order.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            updatedProducts[productIndex].stock -= item.quantity;
        }
    });

    const updatedSalesOrders = currentSalesOrders.map(o => 
        o.id === order.id ? { ...o, status: 'invoiced' as const } : o
    );

    // Update all states together
    setSalesOrders(updatedSalesOrders);
    setSales([newSale, ...currentSales]);
    setProducts(updatedProducts);
    
    alert('تم تحويل طلب البيع إلى فاتورة بنجاح!');
  };

  const getStatusChip = (status: SalesOrder['status']) => {
    switch(status) {
        case 'pending': return <span className="px-2 py-1 text-xs font-bold bg-yellow-900 text-yellow-200 rounded-full">قيد الانتظار</span>;
        case 'invoiced': return <span className="px-2 py-1 text-xs font-bold bg-green-900 text-green-200 rounded-full">تمت الفوترة</span>;
        case 'cancelled': return <span className="px-2 py-1 text-xs font-bold bg-red-900 text-red-200 rounded-full">ملغى</span>;
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-100">إدارة طلبات البيع</h2>
        <div className="flex gap-4 items-center flex-wrap">
            <input 
                type="text"
                placeholder="ابحث برقم الطلب أو اسم العميل..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            />
            <button onClick={() => handleOpenFormModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
              إنشاء طلب بيع
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 font-semibold text-gray-300">رقم الطلب</th>
                <th className="p-4 font-semibold text-gray-300">العميل</th>
                <th className="p-4 font-semibold text-gray-300">التاريخ</th>
                <th className="p-4 font-semibold text-gray-300">الإجمالي</th>
                <th className="p-4 font-semibold text-gray-300">الحالة</th>
                <th className="p-4 font-semibold text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 text-gray-300">{order.orderNumber}</td>
                  <td className="p-4 font-medium text-gray-200">{order.customerName}</td>
                  <td className="p-4 text-gray-300">{new Date(order.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-bold text-sky-400">{order.total.toFixed(2)} ج.م</td>
                  <td className="p-4">{getStatusChip(order.status)}</td>
                  <td className="p-4 flex gap-4 items-center">
                    <button onClick={() => handleOpenPreviewModal(order)} className="text-gray-400 hover:text-gray-300">عرض</button>
                    {isAdmin && order.status === 'pending' && <>
                      <button onClick={() => handleConvertToInvoice(order)} className="text-green-400 hover:text-green-300">تحويل لفاتورة</button>
                      <button onClick={() => handleOpenFormModal(order)} className="text-blue-400 hover:text-blue-300">تعديل</button>
                      <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="text-red-400 hover:text-red-300">إلغاء</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
            title="لا توجد طلبات بيع بعد"
            message="أنشئ طلبات بيع لتسجيل طلبيات العملاء قبل فوترتها."
            action={{
              label: "إنشاء طلب بيع جديد",
              onClick: () => handleOpenFormModal(),
            }}
          />
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={orderToEdit ? 'تعديل طلب بيع' : 'إنشاء طلب بيع جديد'} size="4xl">
        <SalesOrderForm onSave={handleSaveOrder} onClose={handleCloseFormModal} orderToEdit={orderToEdit} currentUser={currentUser} />
      </Modal>

      <Modal isOpen={isPreviewModalOpen} onClose={handleClosePreviewModal} title="معاينة طلب البيع" size="4xl">
        {orderToPreview && <SalesOrderPreview order={orderToPreview} onClose={handleClosePreviewModal} />}
      </Modal>
    </div>
  );
};