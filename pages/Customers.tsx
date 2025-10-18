
// Fix: Implementing the Customers page which was previously a placeholder file.
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Customer, Sale } from '../types';
import { Modal } from '../components/Modal';
import { initialCustomers } from '../data/initialData';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';
import { EmptyState } from '../components/EmptyState';

// A simple form for adding/editing customers, can be in the same file for simplicity
const CustomerForm: React.FC<{ onSave: (customer: Customer) => void; onClose: () => void; customerToEdit: Customer | null }> = ({ onSave, onClose, customerToEdit }) => {
    const [customer, setCustomer] = useState(customerToEdit || { id: '', name: '', phone: '', address: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...customer, id: customerToEdit?.id || crypto.randomUUID() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">الاسم</label>
                <input type="text" name="name" value={customer.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">رقم الهاتف</label>
                <input type="text" name="phone" value={customer.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">العنوان</label>
                <input type="text" name="address" value={customer.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md">حفظ</button>
            </div>
        </form>
    );
};


export const Customers: React.FC = () => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
  const [sales] = useLocalStorage<Sale[]>('sales', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const customersWithStats = useMemo(() => {
    return filteredCustomers.map(customer => {
      const customerSales = sales.filter(sale => sale.customerId === customer.id);
      const totalSales = customerSales.reduce((sum, sale) => sum + sale.total, 0);
      return {
        ...customer,
        totalSales,
        invoiceCount: customerSales.length,
      };
    });
  }, [filteredCustomers, sales]);

  const handleOpenModal = (customer?: Customer) => {
    setCustomerToEdit(customer || null);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setCustomerToEdit(null);
    setIsModalOpen(false);
  };
  
  const handleSaveCustomer = (customer: Customer) => {
    if (customerToEdit) {
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers([...customers, customer]);
    }
    handleCloseModal();
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا العميل؟')) {
        setCustomers(customers.filter(c => c.id !== customerId));
    }
    setOpenMenuId(null);
  };

  const handleExport = () => {
    const csvData = jsonToCsv(customersWithStats);
    downloadCsv(csvData, createExportFilename('customers'));
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-100">إدارة العملاء</h2>
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
              إضافة عميل جديد
            </button>
        </div>
      </div>

      <div>
        {customersWithStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {customersWithStats.map((customer) => (
              <div key={customer.id} className="bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-sky-900/50 hover:border-sky-700 border border-transparent">
                  <div>
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                          <div className="relative">
                              <button onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)} className="text-gray-400 hover:text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                              </button>
                              {openMenuId === customer.id && (
                                  <div className="absolute left-0 mt-2 w-32 bg-gray-900 rounded-md shadow-lg z-10">
                                      <button onClick={() => handleOpenModal(customer)} className="block w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">تعديل</button>
                                      <button onClick={() => handleDeleteCustomer(customer.id)} className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700">حذف</button>
                                  </div>
                              )}
                          </div>
                      </div>
                      <div className="space-y-3 text-gray-400">
                          <p className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {customer.phone}</p>
                          <p className="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {customer.address}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-center">
                          <div>
                              <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                              <p className="text-lg font-bold text-sky-400">{customer.totalSales.toFixed(2)} ج.م</p>
                          </div>
                           <div>
                              <p className="text-sm text-gray-500">عدد الفواتير</p>
                              <p className="text-lg font-bold text-sky-400">{customer.invoiceCount}</p>
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <a href={`tel:${customer.phone}`} className="flex-1 text-center px-4 py-2 bg-green-800/50 text-green-300 rounded-md hover:bg-green-700/50 text-sm">اتصال</a>
                    <a href={`sms:${customer.phone}`} className="flex-1 text-center px-4 py-2 bg-blue-800/50 text-blue-300 rounded-md hover:bg-blue-700/50 text-sm">رسالة</a>
                  </div>
              </div>
            ))}
          </div>
        ) : (
           customers.length > 0 ? (
            <p className="text-center py-8 text-gray-400">لا يوجد عملاء يطابقون البحث.</p>
          ) : (
            <EmptyState
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              title="لا يوجد عملاء بعد"
              message="أضف عملاءك لتسريع عملية إنشاء الفواتير وتتبع مبيعاتهم."
              action={{
                label: "إضافة عميل جديد",
                onClick: () => handleOpenModal(),
              }}
            />
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={customerToEdit ? 'تعديل عميل' : 'إضافة عميل جديد'}>
        <CustomerForm onSave={handleSaveCustomer} onClose={handleCloseModal} customerToEdit={customerToEdit} />
      </Modal>
    </div>
  );
};