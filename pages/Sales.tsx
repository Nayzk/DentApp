
// Fix: Implementing the Sales page which was previously a placeholder file.
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Sale, Product, User } from '../types';
import { Modal } from '../components/Modal';
import { SalesForm } from '../components/SalesForm';
import { InvoicePreview } from '../components/InvoicePreview';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';
import { EmptyState } from '../components/EmptyState';

interface SalesProps {
    currentUser: User;
}

export const Sales: React.FC<SalesProps> = ({ currentUser }) => {
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [, setProducts] = useLocalStorage<Product[]>('products', []);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [saleToPreview, setSaleToPreview] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = currentUser.role === 'admin';

  const filteredSales = useMemo(() => {
    return sales
      .filter(s => 
        s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm]);

  const handleOpenFormModal = (sale?: Sale) => {
    setSaleToEdit(sale || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setSaleToEdit(null);
    setIsFormModalOpen(false);
  };
  
  const handleOpenPreviewModal = (sale: Sale) => {
    setSaleToPreview(sale);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setSaleToPreview(null);
    setIsPreviewModalOpen(false);
  };
  
  const handleSaveSale = (sale: Sale, updatedProducts: Product[]) => {
    if (saleToEdit) {
      setSales(sales.map(s => s.id === sale.id ? sale : s));
    } else {
      setSales([sale, ...sales]);
    }
    setProducts(updatedProducts); // Update stock levels
    handleCloseFormModal();
  };
  
  const handleDeleteSale = (saleId: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ سيتم إرجاع الكميات المباعة إلى المخزون.')) {
        const saleToDelete = sales.find(s => s.id === saleId);
        if (!saleToDelete) return;

        // Revert stock changes
        setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            saleToDelete.items.forEach(item => {
                const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
                if (productIndex > -1) {
                    updatedProducts[productIndex].stock += item.quantity;
                }
            });
            return updatedProducts;
        });
        
        setSales(sales.filter(s => s.id !== saleId));
    }
  };
  
  const handleExport = () => {
    const csvData = jsonToCsv(filteredSales);
    downloadCsv(csvData, createExportFilename('sales'));
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-100">إدارة المبيعات</h2>
        <div className="flex gap-4 items-center flex-wrap">
            <input 
                type="text"
                placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            />
            <button onClick={handleExport} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
              تصدير
            </button>
            <button onClick={() => handleOpenFormModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
              إنشاء فاتورة جديدة
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredSales.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 font-semibold text-gray-300">رقم الفاتورة</th>
                <th className="p-4 font-semibold text-gray-300">العميل</th>
                <th className="p-4 font-semibold text-gray-300">التاريخ</th>
                <th className="p-4 font-semibold text-gray-300">الإجمالي</th>
                <th className="p-4 font-semibold text-gray-300">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 text-gray-300">{sale.invoiceNumber}</td>
                  <td className="p-4 font-medium text-gray-200">{sale.customerName}</td>
                  <td className="p-4 text-gray-300">{new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-bold text-sky-400">{sale.total.toFixed(2)} ج.م</td>
                  <td className="p-4 flex gap-4">
                    <button onClick={() => handleOpenPreviewModal(sale)} className="text-green-400 hover:text-green-300">عرض</button>
                    {isAdmin && <>
                      <button onClick={() => handleOpenFormModal(sale)} className="text-blue-400 hover:text-blue-300">تعديل</button>
                      <button onClick={() => handleDeleteSale(sale.id)} className="text-red-400 hover:text-red-300">حذف</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
            title="لا توجد فواتير بعد"
            message="ابدأ بإنشاء فاتورة جديدة لتسجيل عمليات البيع."
            action={{
              label: "إنشاء فاتورة جديدة",
              onClick: () => handleOpenFormModal(),
            }}
          />
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={saleToEdit ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة'} size="4xl">
        <SalesForm onSave={handleSaveSale} onClose={handleCloseFormModal} saleToEdit={saleToEdit} currentUser={currentUser} sales={sales} />
      </Modal>

      <Modal isOpen={isPreviewModalOpen} onClose={handleClosePreviewModal} title="معاينة الفاتورة" size="4xl">
        {saleToPreview && <InvoicePreview sale={saleToPreview} onClose={handleClosePreviewModal} />}
      </Modal>
    </div>
  );
};