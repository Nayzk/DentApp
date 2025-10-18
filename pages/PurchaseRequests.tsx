
// Fix: Implementing the PurchaseRequests page which was previously a placeholder file.
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { PurchaseRequest, PurchaseRequestItem, Product, User, Order, OrderItem } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { initialProducts } from '../data/initialData';

// Purchase Request Form Component
const PurchaseRequestForm: React.FC<{ onSave: (request: Omit<PurchaseRequest, 'id' | 'requestNumber' | 'date' | 'linkedOrderId' | 'linkedOrderNumber'>) => void; onClose: () => void; products: Product[]; currentUser: User; }> = ({ onSave, onClose, products, currentUser }) => {
    const [items, setItems] = useState<PurchaseRequestItem[]>([]);
    
    const handleAddItem = () => {
        setItems([...items, { productId: '', productName: '', quantity: 1, reason: '' }]);
    };
    
    const handleItemChange = (index: number, field: keyof PurchaseRequestItem, value: any) => {
        const newItems = [...items];
        const item = newItems[index];
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                item.productId = product.id;
                item.productName = product.name;
            }
        } else {
            (item as any)[field] = value;
        }
        setItems(newItems);
    };
    
    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)) {
            alert('يرجى إضافة أصناف صحيحة للطلب.');
            return;
        }
        onSave({ requestedBy: currentUser.username, items, status: 'pending' });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                <h3 className="text-lg font-medium text-gray-200">الأصناف المطلوبة</h3>
                {items.map((item, index) => (
                    <div key={index} className="space-y-2 p-3 bg-gray-800 rounded-md">
                        <div className="flex items-center gap-4">
                             <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} required className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md">
                              <option value="">اختر صنف...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="number" placeholder="الكمية" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md" />
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300">&times;</button>
                        </div>
                        <input type="text" placeholder="سبب الطلب (اختياري)" value={item.reason} onChange={e => handleItemChange(index, 'reason', e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md" />
                    </div>
                ))}
                <button type="button" onClick={handleAddItem} className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600">إضافة صنف</button>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">إرسال الطلب</button>
            </div>
        </form>
    );
};

export const PurchaseRequests: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [requests, setRequests] = useLocalStorage<PurchaseRequest[]>('purchase-requests', []);
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = currentUser.role === 'admin';
  
  const userRequests = useMemo(() => {
      const sorted = requests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (isAdmin) return sorted;
      return sorted.filter(r => r.requestedBy === currentUser.username);
  }, [requests, isAdmin, currentUser.username]);

  const handleSaveRequest = (requestData: Omit<PurchaseRequest, 'id' | 'requestNumber' | 'date' | 'linkedOrderId' | 'linkedOrderNumber'>) => {
      const newRequest: PurchaseRequest = {
          ...requestData,
          id: crypto.randomUUID(),
          requestNumber: `PR-${Date.now()}`,
          date: new Date().toISOString(),
      };
      setRequests([newRequest, ...requests]);
      setIsModalOpen(false);
  };
  
  const handleUpdateStatus = (requestId: string, status: PurchaseRequest['status']) => {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      if (status === 'approved') {
          // Create a new purchase order from the request
          const newOrderItems: OrderItem[] = request.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              const price = product?.purchasePrice || 0;
              return {
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  price: price,
                  total: item.quantity * price,
              };
          });

          const newOrder: Order = {
              id: crypto.randomUUID(),
              orderNumber: `PO-${Date.now()}`,
              date: new Date().toISOString(),
              supplierId: '', // Admin needs to set this manually
              supplierName: 'لم يحدد بعد',
              items: newOrderItems,
              total: newOrderItems.reduce((sum, item) => sum + item.total, 0),
              status: 'pending',
              notes: `تم إنشاؤه من طلب الشراء: ${request.requestNumber}`
          };
          setOrders([newOrder, ...orders]);
          setRequests(requests.map(r => r.id === requestId ? { ...r, status, linkedOrderId: newOrder.id, linkedOrderNumber: newOrder.orderNumber } : r));
          alert('تمت الموافقة على الطلب وإنشاء أمر شراء جديد. يرجى مراجعة صفحة المشتريات لتحديد المورد.');
      } else { // For 'rejected' status
        setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
      }
  };
  
  const getStatusChip = (status: PurchaseRequest['status']) => {
    switch(status) {
        case 'pending': return <span className="px-2 py-1 text-xs font-bold bg-yellow-900 text-yellow-200 rounded-full">قيد المراجعة</span>;
        case 'approved': return <span className="px-2 py-1 text-xs font-bold bg-green-900 text-green-200 rounded-full">تمت الموافقة</span>;
        case 'rejected': return <span className="px-2 py-1 text-xs font-bold bg-red-900 text-red-200 rounded-full">مرفوض</span>;
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">طلبات الشراء</h2>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
            إنشاء طلب جديد
        </button>
      </div>
      
      <div className="overflow-x-auto">
          {userRequests.length > 0 ? (
              <table className="w-full text-right">
                  <thead className="bg-gray-800">
                      <tr>
                          <th className="p-4 font-semibold text-gray-300">رقم الطلب</th>
                          <th className="p-4 font-semibold text-gray-300">التاريخ</th>
                          {isAdmin && <th className="p-4 font-semibold text-gray-300">مقدم الطلب</th>}
                          <th className="p-4 font-semibold text-gray-300">الأصناف</th>
                          <th className="p-4 font-semibold text-gray-300">الحالة</th>
                          {isAdmin && <th className="p-4 font-semibold text-gray-300">إجراء</th>}
                      </tr>
                  </thead>
                  <tbody>
                      {userRequests.map(req => (
                          <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-800">
                              <td className="p-4 text-gray-300">{req.requestNumber}</td>
                              <td className="p-4 text-gray-300">{new Date(req.date).toLocaleDateString('ar-EG')}</td>
                              {isAdmin && <td className="p-4 text-gray-200">{req.requestedBy}</td>}
                              <td className="p-4 text-gray-300">{req.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}</td>
                              <td className="p-4">
                                {getStatusChip(req.status)}
                                {req.status === 'approved' && req.linkedOrderNumber && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        مرتبط بـ: <span className="font-semibold text-sky-400">{req.linkedOrderNumber}</span>
                                    </div>
                                )}
                              </td>
                              {isAdmin && (
                                  <td className="p-4">
                                    {req.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="text-sm px-2 py-1 bg-green-800/80 text-green-200 rounded-md hover:bg-green-700/80">موافقة</button>
                                            <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="text-sm px-2 py-1 bg-red-800/80 text-red-200 rounded-md hover:bg-red-700/80">رفض</button>
                                        </div>
                                    ) : req.status === 'approved' ? (
                                        <span className="text-sm text-green-400">تم إنشاء أمر شراء</span>
                                    ) : (
                                        <span className="text-sm text-red-400">تم الرفض</span>
                                    )}
                                  </td>
                              )}
                          </tr>
                      ))}
                  </tbody>
              </table>
          ) : (
              <EmptyState
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                title="لا توجد طلبات شراء"
                message="ابدأ بإنشاء طلب شراء جديد لتزويد المخزون أو عرض طلباتك السابقة."
                action={{ label: "إنشاء طلب جديد", onClick: () => setIsModalOpen(true) }}
              />
          )}
      </div>
      
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء طلب شراء جديد">
        <PurchaseRequestForm onSave={handleSaveRequest} onClose={() => setIsModalOpen(false)} products={products} currentUser={currentUser} />
      </Modal>
    </div>
  );
};