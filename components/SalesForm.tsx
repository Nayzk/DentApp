
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Sale, SaleItem, Product, Customer, User } from '../types';
import { initialProducts, initialCustomers } from '../data/initialData';
import { Modal } from './Modal';
import { InvoicePreview } from './InvoicePreview';

interface SalesFormProps {
  onSave: (sale: Sale, updatedProducts: Product[]) => void;
  onClose: () => void;
  saleToEdit: Sale | null;
  currentUser: User;
  sales: Sale[];
}

export const SalesForm: React.FC<SalesFormProps> = ({ onSave, onClose, saleToEdit, currentUser, sales }) => {
  const [products] = useLocalStorage<Product[]>('products', initialProducts);
  const [customers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [saleToPreview, setSaleToPreview] = useState<Sale | null>(null);
  const isAdmin = currentUser.role === 'admin';

  const getNextInvoiceNumber = () => {
    const highestNumber = sales
        .map(s => {
            const match = s.invoiceNumber.match(/^INV-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .reduce((max, num) => Math.max(max, num), 0);
    
    return `INV-${(highestNumber + 1).toString().padStart(4, '0')}`;
  };

  useEffect(() => {
    if (saleToEdit) {
      setCustomerId(saleToEdit.customerId);
      setItems(saleToEdit.items);
      if (isAdmin && saleToEdit.subtotal > 0) {
        const percentage = (saleToEdit.discount / saleToEdit.subtotal) * 100;
        setDiscountPercentage(percentage);
      } else {
        setDiscountPercentage(0);
      }
      setNotes(saleToEdit.notes || '');
    } else {
        // Reset form for new sale
        setCustomerId('');
        setItems([]);
        setDiscountPercentage(0);
        setNotes('');
    }
  }, [saleToEdit, isAdmin]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, price: 0, total: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
            item.productId = product.id;
            item.productName = product.name;
            item.price = product.sellPrice;
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
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal > 0 && isAdmin ? (subtotal * discountPercentage) / 100 : 0;
  const total = subtotal - discountAmount;

  const handlePreview = () => {
    if (!customerId || items.length === 0) {
      alert('يرجى اختيار عميل وإضافة صنف واحد على الأقل للمعاينة.');
      return;
    }
    const saleForPreview: Sale = {
      id: saleToEdit?.id || 'preview-id',
      invoiceNumber: saleToEdit?.invoiceNumber || getNextInvoiceNumber(),
      date: new Date().toISOString(),
      customerId,
      customerName: customers.find(c => c.id === customerId)?.name || 'N/A',
      items,
      subtotal,
      discount: discountAmount,
      total,
      notes,
    };
    setSaleToPreview(saleForPreview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || items.length === 0) {
      alert('يرجى اختيار عميل وإضافة صنف واحد على الأقل.');
      return;
    }

    const updatedProducts = [...products];
    let stockError = false;

    items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
            const product = updatedProducts[productIndex];
            const originalStock = saleToEdit?.items.find(i => i.productId === item.productId)?.quantity || 0;
            const stockChange = item.quantity - originalStock;

            if (product.stock < stockChange) {
                alert(`المخزون غير كافٍ لصنف: ${item.productName}. المتوفر: ${product.stock}`);
                stockError = true;
            } else {
                product.stock -= stockChange;
            }
        }
    });

    if (stockError) return;

    const saleData: Sale = {
      id: saleToEdit?.id || crypto.randomUUID(),
      invoiceNumber: saleToEdit?.invoiceNumber || getNextInvoiceNumber(),
      date: new Date().toISOString(),
      customerId,
      customerName: customers.find(c => c.id === customerId)?.name || 'N/A',
      items,
      subtotal,
      discount: discountAmount,
      total,
      notes,
    };
    
    onSave(saleData, updatedProducts);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-300 mb-1">العميل</label>
          <select id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md">
            <option value="">اختر عميل...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">الأصناف</h3>
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-800 rounded-md">
              <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} required className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md">
                <option value="">اختر صنف...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (المتوفر: {p.stock})</option>)}
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

        <div className="grid grid-cols-2 gap-6 items-start pt-4 border-t border-gray-700">
          {isAdmin ? (
              <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-1">نسبة الخصم (%)</label>
              <input 
                  type="number" 
                  id="discount" 
                  value={discountPercentage} 
                  onChange={e => setDiscountPercentage(Math.max(0, Math.min(100, Number(e.target.value))))} 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md" 
                  placeholder="0-100"
              />
              </div>
          ) : <div /> }
          <div className="text-left space-y-1">
            <p className="text-gray-400 flex justify-between"><span>المجموع الفرعي:</span> <span className="font-semibold text-gray-200">{subtotal.toFixed(2)} ج.م</span></p>
            {isAdmin && (<p className="text-gray-400 flex justify-between"><span>قيمة الخصم:</span> <span className="font-semibold text-red-400">- {discountAmount.toFixed(2)} ج.م</span></p>)}
            <p className="text-xl font-bold text-sky-400 border-t border-gray-600 pt-2 mt-2 flex justify-between"><span>الإجمالي:</span> <span className="text-2xl">{total.toFixed(2)} ج.م</span></p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">إلغاء</button>
          <button type="button" onClick={handlePreview} className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">معاينة الفاتورة</button>
          <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">حفظ الفاتورة</button>
        </div>
      </form>
      <Modal isOpen={!!saleToPreview} onClose={() => setSaleToPreview(null)} title="معاينة الفاتورة" size="4xl">
        {saleToPreview && <InvoicePreview sale={saleToPreview} onClose={() => setSaleToPreview(null)} />}
      </Modal>
    </>
  );
};