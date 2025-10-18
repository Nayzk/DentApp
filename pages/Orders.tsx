
// Fix: Implementing the Orders page which was previously a placeholder file.
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Order, Product, User } from '../types';
import { Modal } from '../components/Modal';
import { OrderForm } from '../components/OrderForm';
import { OrderPreview } from '../components/OrderPreview';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';
import { EmptyState } from '../components/EmptyState';
import { initialProducts } from '../data/initialData';

interface OrdersProps {
    currentUser: User;
}

export const Orders: React.FC<OrdersProps> = ({ currentUser }) => {
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToPreview, setOrderToPreview] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = currentUser.role === 'admin';

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchTerm]);

  const handleOpenFormModal = (order?: Order) => {
    setOrderToEdit(order || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setOrderToEdit(null);
    setIsFormModalOpen(false);
  };
  
  const handleOpenPreviewModal = (order: Order) => {
    setOrderToPreview(order);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setOrderToPreview(null);
    setIsPreviewModalOpen(false);
  };
  
  const handleSaveOrder = (order: Order) => {
    if (orderToEdit) {
      setOrders(orders.map(o => o.id === order.id ? order : o));
    } else {
      setOrders([order, ...orders]);
    }
    handleCloseFormModal();
  };
  
  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    if (status === 'completed' && orderToUpdate.status !== 'completed') {
        if (!window.confirm('هل أنت متأكد من إكمال هذا الطلب؟ سيتم إضافة الكميات المستلمة إلى المخزون.')) {
            return;
        }
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            orderToUpdate.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex > -1) {
                    updatedProducts[productIndex].stock += item.quantity;
                } else {
                    const newProduct: Product = { 
                      id: item.productId,
                      name: item.productName,
                      code: `NEW-${item.productId.slice(0,4)}`,
                      description: 'تمت إضافته تلقائيًا من أمر شراء. يرجى مراجعة التفاصيل.',
                      purchasePrice: item.price,
                      sellPrice: item.price * 1.25, // default markup
                      stock: item.quantity,
                      expiryDate: null
                    };
                    updatedProducts.push(newProduct);
                }
            });
            return updatedProducts;
        });
    } else if (orderToUpdate.status === 'completed' && status !== 'completed') {
        if (!window.confirm('هل أنت متأكد من التراجع عن إكمال هذا الطلب؟ سيتم خصم الكميات من المخزون.')) {
            return;
        }
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            orderToUpdate.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex > -1) {
                    updatedProducts[productIndex].stock = Math.max(0, updatedProducts[productIndex].stock - item.quantity);
                }
            });
            return updatedProducts;
        });
    }

    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };
  
  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;
    
    if(window.confirm('هل أنت متأكد من رغبتك في حذف أمر الشراء هذا؟')) {
        if (orderToDelete.status === 'completed') {
            if (window.confirm('هذا الطلب مكتمل. حذفه سيؤدي إلى خصم الكميات من المخزون. هل تريد المتابعة؟')) {
                 setProducts(prevProducts => {
                    const updatedProducts = [...prevProducts];
                    orderToDelete.items.forEach(item => {
                        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                        if (productIndex > -1) {
                            updatedProducts[productIndex].stock = Math.max(0, updatedProducts[productIndex].stock - item.quantity);
                        }
                    });
                    return updatedProducts;
                });
            } else {
                return; 
            }
        }
        setOrders(orders.filter(o => o.id !== orderId));
    }
  };
  
  const handleExport = () => {
    const csvData = jsonToCsv(filteredOrders);
    downloadCsv(csvData, createExportFilename('purchase-orders'));
  };
  
  const getStatusChip = (status: Order['status']) => {
    switch(status) {
        case 'pending': return <span className="px-2 py-1 text-xs font-bold bg-yellow-900 text-yellow-200 rounded-full">قيد الانتظار</span>;
        case 'completed': return <span className="px-2 py-1 text-xs font-bold bg-green-900 text-green-200 rounded-full">مكتمل</span>;
        case 'cancelled': return <span className="px-2 py-1 text-xs font-bold bg-red-900 text-red-200 rounded-full">ملغى</span>;
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-100">إدارة المشتريات</h2>
        {isAdmin && <div className="flex gap-4 items-center flex-wrap">
            <input 
                type="text"
                placeholder="ابحث برقم الطلب أو اسم المورد..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            />
            <button onClick={handleExport} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
              تصدير
            </button>
            <button onClick={() => handleOpenFormModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
              إنشاء أمر شراء
            </button>
        </div>}
      </div>

      <div className="overflow-x-auto">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 font-semibold text-gray-300">رقم الطلب</th>
                <th className="p-4 font-semibold text-gray-300">المورد</th>
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
                  <td className="p-4 font-medium text-gray-200">{order.supplierName}</td>
                  <td className="p-4 text-gray-300">{new Date(order.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-bold text-sky-400">{order.total.toFixed(2)} ج.م</td>
                  <td className="p-4">{getStatusChip(order.status)}</td>
                  <td className="p-4 flex gap-4 items-center">
                    <button onClick={() => handleOpenPreviewModal(order)} className="text-green-400 hover:text-green-300">عرض</button>
                    {isAdmin && <>
                      <button onClick={() => handleOpenFormModal(order)} className="text-blue-400 hover:text-blue-300">تعديل</button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-red-400 hover:text-red-300">حذف</button>
                      {order.status !== 'completed' && <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="text-sm px-2 py-1 bg-green-800 rounded-md">إكمال</button>}
                      {order.status !== 'cancelled' && <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="text-sm px-2 py-1 bg-red-800 rounded-md">إلغاء</button>}
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            title="لا توجد أوامر شراء بعد"
            message="يمكن للمديرين إنشاء أوامر شراء جديدة لتزويد المخزون."
            action={isAdmin ? {
              label: "إنشاء أمر شراء",
              onClick: () => handleOpenFormModal(),
            } : undefined}
          />
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={orderToEdit ? 'تعديل أمر شراء' : 'إنشاء أمر شراء'} size="4xl">
        <OrderForm onSave={handleSaveOrder} onClose={handleCloseFormModal} orderToEdit={orderToEdit} />
      </Modal>

      <Modal isOpen={isPreviewModalOpen} onClose={handleClosePreviewModal} title="معاينة أمر الشراء" size="4xl">
        {orderToPreview && <OrderPreview order={orderToPreview} onClose={handleClosePreviewModal} />}
      </Modal>
    </div>
  );
};