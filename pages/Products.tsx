
import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Product, User } from '../types';
import { Modal } from '../components/Modal';
import { ProductForm } from '../components/ProductForm';
import { initialProducts } from '../data/initialData';
import { jsonToCsv, downloadCsv, createExportFilename } from '../utils/export';
import { EmptyState } from '../components/EmptyState';

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

interface ProductsProps {
  currentUser: User;
}

export const Products: React.FC<ProductsProps> = ({ currentUser }) => {
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  
  const isAdmin = currentUser.role === 'admin';

  // Effect to check for navigation from notifications
  useEffect(() => {
    const filter = localStorage.getItem('products_filter');
    if (filter === 'low_stock') {
      setStockFilter('low_stock');
      localStorage.removeItem('products_filter'); // Clear the flag
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (stockFilter === 'in_stock') return p.stock > 0;
        if (stockFilter === 'low_stock') return p.stock > 0 && p.stock < 10;
        if (stockFilter === 'out_of_stock') return p.stock === 0;
        return true;
      })
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, stockFilter]);
  
  const getExpiryStatus = (expiryDate?: string | null): 'ok' | 'expiring_soon' | 'expired' => {
      if (!expiryDate) return 'ok';
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return 'expired';
      if (diffDays <= 30) return 'expiring_soon';
      return 'ok';
  };

  const handleOpenModal = (product?: Product) => {
    setProductToEdit(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setProductToEdit(null);
    setIsModalOpen(false);
  };
  
  const handleSaveProduct = (product: Product) => {
    if (productToEdit) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    handleCloseModal();
  };
  
  const handleDeleteProduct = (productId: string) => {
    if(window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
        setProducts(products.filter(p => p.id !== productId));
    }
  };
  
  const handleExport = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dataToExport = isAdmin ? filteredProducts : filteredProducts.map(({ purchasePrice, ...rest }) => rest);
    const csvData = jsonToCsv(dataToExport);
    downloadCsv(csvData, createExportFilename('products'));
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-100">إدارة الأصناف</h2>
        <div className="flex gap-4 items-center flex-wrap">
            <input 
                type="text"
                placeholder="ابحث بالاسم أو الكود..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            />
            <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as StockFilter)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            >
                <option value="all">كل الحالات</option>
                <option value="in_stock">متوفر</option>
                <option value="low_stock">مخزون منخفض</option>
                <option value="out_of_stock">نفد المخزون</option>
            </select>
            <button onClick={handleExport} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 shadow-sm transition-colors">
              تصدير
            </button>
            {isAdmin && (
              <button onClick={() => handleOpenModal()} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 shadow-sm transition-colors">
                إضافة صنف جديد
              </button>
            )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredProducts.length > 0 ? (
          <table className="w-full text-right">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 font-semibold text-gray-300">كود الصنف</th>
                <th className="p-4 font-semibold text-gray-300">اسم الصنف</th>
                {isAdmin && <th className="p-4 font-semibold text-gray-300">سعر الشراء</th>}
                <th className="p-4 font-semibold text-gray-300">سعر البيع</th>
                <th className="p-4 font-semibold text-gray-300">المخزون</th>
                <th className="p-4 font-semibold text-gray-300">تاريخ الصلاحية</th>
                {isAdmin && <th className="p-4 font-semibold text-gray-300">إجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const expiryStatus = getExpiryStatus(product.expiryDate);
                const rowClass = {
                    'ok': 'hover:bg-gray-800',
                    'expiring_soon': 'bg-yellow-900 bg-opacity-30 hover:bg-yellow-900 hover:bg-opacity-50',
                    'expired': 'bg-red-900 bg-opacity-40 hover:bg-red-900 hover:bg-opacity-60'
                }[expiryStatus];

                return (
                <tr key={product.id} className={`border-b border-gray-700 ${rowClass}`}>
                  <td className="p-4 text-gray-300">{product.code}</td>
                  <td className="p-4 font-medium text-gray-200">{product.name}</td>
                  {isAdmin && <td className="p-4 text-gray-300">{product.purchasePrice.toFixed(2)} ج.م</td>}
                  <td className="p-4 text-gray-300">{product.sellPrice.toFixed(2)} ج.م</td>
                  <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${product.stock < 10 && product.stock > 0 ? 'bg-yellow-900 text-yellow-200' : product.stock === 0 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                          {product.stock}
                      </span>
                  </td>
                  <td className="p-4 text-gray-300">
                      {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('ar-EG') : 'لا يوجد'}
                      {expiryStatus === 'expiring_soon' && <span className="text-yellow-400 ms-2">(قارب على الانتهاء)</span>}
                      {expiryStatus === 'expired' && <span className="text-red-400 ms-2">(منتهي الصلاحية)</span>}
                  </td>
                  {isAdmin && (
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleOpenModal(product)} className="text-blue-400 hover:text-blue-300">تعديل</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300">حذف</button>
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        ) : (
          products.length > 0 ? (
            <p className="text-center py-8 text-gray-400">لا توجد أصناف تطابق البحث.</p>
          ) : (
            <EmptyState
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
              title="لا توجد أصناف بعد"
              message="ابدأ بإضافة صنفك الأول لتتمكن من تتبع المخزون وإنشاء الفواتير."
              action={isAdmin ? {
                label: "إضافة صنف جديد",
                onClick: () => handleOpenModal(),
              } : undefined}
            />
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={productToEdit ? 'تعديل صنف' : 'إضافة صنف جديد'}>
        <ProductForm onSave={handleSaveProduct} onClose={handleCloseModal} productToEdit={productToEdit} />
      </Modal>
    </div>
  );
};