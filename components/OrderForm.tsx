
// Fix: Implementing the OrderForm component which was previously a placeholder file.
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Order, OrderItem, Product, Supplier } from '../types';
import { initialProducts, initialSuppliers } from '../data/initialData';

interface OrderFormProps {
  onSave: (order: Order) => void;
  onClose: () => void;
  orderToEdit: Order | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSave, onClose, orderToEdit }) => {
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [suppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setSupplierId(orderToEdit.supplierId);
      setItems(orderToEdit.items);
      setNotes(orderToEdit.notes || '');
    }
  }, [orderToEdit]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productId = product.id;
            item.productName = product.name;
            item.price = product.purchasePrice;
        }
    } else {
        (item as any)[field] = value;
    }
    
    item.total = item.quantity * item.price;
    newItems[index] = item;
    setItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const total = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId || items.length === 0) {
      alert('يرجى اختيار مورد وإضافة صنف واحد على الأقل.');
      return;
    }

    const orderData: Order = {
      id: orderToEdit?.id || crypto.randomUUID(),
      orderNumber: orderToEdit?.orderNumber || `PO-${Date.now()}`,
      date: new Date().toISOString(),
      supplierId,
      supplierName: suppliers.find(s => s.id === supplierId)?.name || 'N/A',
      items,
      total,
      status: orderToEdit?.status || 'pending',
      notes,
    };
    
    onSave(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-300 mb-1">المورد</label>
        <select id="supplier" value={supplierId} onChange={e => setSupplierId(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md">
          <option value="">اختر مورد...</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-200">الأصناف المطلوبة</h3>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 bg-gray-800 rounded-md">
            <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} required className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md">
              <option value="">اختر صنف...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} required className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md" />
            <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} required className="w-28 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md" />
            <span className="w-28 text-gray-300">{item.total.toFixed(2)} ج.م</span>
            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300">&times;</button>
          </div>
        ))}
        <button type="button" onClick={handleAddItem} className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600">إضافة صنف</button>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">ملاحظات</label>
        <textarea name="notes" id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md"></textarea>
      </div>

      <div className="text-left">
        <p className="text-xl font-bold text-sky-400">الإجمالي: <span className="text-2xl">{total.toFixed(2)} ج.م</span></p>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">إلغاء</button>
        <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">حفظ أمر الشراء</button>
      </div>
    </form>
  );
};