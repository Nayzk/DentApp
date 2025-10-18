
// Fix: Implementing the Suppliers page which was previously a placeholder file.
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Supplier, Order } from '../types';
import { Modal } from '../components/Modal';
import { initialSuppliers } from '../data/initialData';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';
import { EmptyState } from '../components/EmptyState';

// Form for adding/editing suppliers
const SupplierForm: React.FC<{ onSave: (supplier: Supplier) => void; onClose: () => void; supplierToEdit: Supplier | null }> = ({ onSave, onClose, supplierToEdit }) => {
    const [supplier, setSupplier] = useState(supplierToEdit || { id: '', name: '', phone: '', address: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupplier({ ...supplier, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...supplier, id: supplierToEdit?.id || crypto.randomUUID() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">الاسم</label>
                <input type="text" name="name" value={supplier.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">رقم الهاتف</label>
                <input type="text" name="phone" value={supplier.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">العنوان</label>
                <input type="text" name="address" value={supplier.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">حفظ</button>
            </div>
        </form>
    );
};


export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
  const [orders] = useLocalStorage<Order[]>('orders', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

   const suppliersWithStats = useMemo(() => {
    return filteredSuppliers.map(supplier => {
      const supplierOrders = orders.filter(order => order.supplierId === supplier.id && order.status === 'completed');
      const totalPurchases = supplierOrders.reduce((sum, order) => sum + order.total, 0);
      return {
        ...supplier,
        totalPurchases,
        orderCount: supplierOrders.length,
      };
    });
  }, [filteredSuppliers, orders]);
  
  const handleOpenModal = (supplier?: Supplier) => {
    setSupplierToEdit(supplier || null);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(false);
  };
  
  const handleSaveSupplier = (supplier: Supplier) => {
    if (supplierToEdit) {
      setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    } else {
      setSuppliers([...suppliers, supplier]);
    }
    handleCloseModal();
  };
  
  const handleDeleteSupplier = (supplierId: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا المورد؟')) {
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
    }
    setOpenMenuId(null);
  };

  const handleExport = () => {
    const csvData = jsonToCsv(suppliersWithStats);
    downloadCsv(csvData, createExportFilename('suppliers'));
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-100">إدارة الموردين</h2>
        <div className="flex gap-4 items-center">
            <input 
                type="text"
                placeholder="ابحث بالاسم أو الهاتف..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            />
            <button onClick={handleExport} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 shadow-sm transition-colors">
              تصدير
            </button>
            <button onClick={() => handleOpenModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
              إضافة مورد جديد
            </button>
        </div>
      </div>

      <div>
        {suppliersWithStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suppliersWithStats.map((supplier) => (
                <div key={supplier.id} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-amber-900/50 hover:border-amber-700 border border-transparent">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{supplier.name}</h3>
                             <div className="relative">
                              <button onClick={() => setOpenMenuId(openMenuId === supplier.id ? null : supplier.id)} className="text-gray-400 hover:text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                              </button>
                              {openMenuId === supplier.id && (
                                  <div className="absolute left-0 mt-2 w-32 bg-gray-900 rounded-md shadow-lg z-10">
                                      <button onClick={() => handleOpenModal(supplier)} className="block w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">تعديل</button>
                                      <button onClick={() => handleDeleteSupplier(supplier.id)} className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700">حذف</button>
                                  </div>
                              )}
                          </div>
                        </div>
                        <div className="space-y-3 text-gray-400">
                            <p className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {supplier.phone}</p>
                            <p className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {supplier.address}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-center">
                          <div>
                              <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                              <p className="text-lg font-bold text-amber-400">{supplier.totalPurchases.toFixed(2)} ج.م</p>
                          </div>
                           <div>
                              <p className="text-sm text-gray-500">عدد الطلبات</p>
                              <p className="text-lg font-bold text-amber-400">{supplier.orderCount}</p>
                          </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <a href={`tel:${supplier.phone}`} className="flex-1 text-center px-4 py-2 bg-green-800/50 text-green-300 rounded-md hover:bg-green-700/50 text-sm">اتصال</a>
                      <a href={`sms:${supplier.phone}`} className="flex-1 text-center px-4 py-2 bg-blue-800/50 text-blue-300 rounded-md hover:bg-blue-700/50 text-sm">رسالة</a>
                    </div>
                </div>
              ))}
          </div>
        ) : (
           suppliers.length > 0 ? (
            <p className="text-center py-8 text-gray-400">لا يوجد موردين يطابقون البحث.</p>
          ) : (
            <EmptyState
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
              title="لا يوجد موردون بعد"
              message="أضف الموردين الذين تتعامل معهم لتسهيل إنشاء طلبات الشراء."
              action={{
                label: "إضافة مورد جديد",
                onClick: () => handleOpenModal(),
              }}
            />
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={supplierToEdit ? 'تعديل مورد' : 'إضافة مورد جديد'}>
        <SupplierForm onSave={handleSaveSupplier} onClose={handleCloseModal} supplierToEdit={supplierToEdit} />
      </Modal>
    </div>
  );
};