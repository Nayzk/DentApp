
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { generateProductDescription } from '../services/geminiService';

interface ProductFormProps {
  onSave: (product: Product) => void;
  onClose: () => void;
  productToEdit: Product | null;
}

const initialProductState: Omit<Product, 'id'> = {
  name: '',
  code: '',
  description: '',
  purchasePrice: 0,
  sellPrice: 0,
  stock: 0,
  expiryDate: null,
};

export const ProductForm: React.FC<ProductFormProps> = ({ onSave, onClose, productToEdit }) => {
  const [product, setProduct] = useState(initialProductState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setProduct({ ...initialProductState, ...productToEdit});
      setHasExpiry(!!productToEdit.expiryDate);
    } else {
      const newCode = `PROD-${Date.now().toString().slice(-6)}`;
      setProduct({ ...initialProductState, code: newCode });
      setHasExpiry(false);
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  
  const handleExpiryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasExpiry(e.target.checked);
    if (!e.target.checked) {
        setProduct({ ...product, expiryDate: null });
    }
  };

  const handleGenerateDescription = async () => {
    if (!product.name) {
      alert("يرجى إدخال اسم المنتج أولاً.");
      return;
    }
    setIsGenerating(true);
    try {
      const description = await generateProductDescription(product.name);
      setProduct({ ...product, description });
    } catch (error) {
      console.error("Failed to generate description:", error);
      alert("فشل إنشاء الوصف. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...product,
      id: productToEdit?.id || crypto.randomUUID(),
      purchasePrice: Number(product.purchasePrice),
      sellPrice: Number(product.sellPrice),
      stock: Number(product.stock),
      expiryDate: hasExpiry ? product.expiryDate : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">اسم الصنف</label>
          <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">كود الصنف</label>
          <input type="text" name="code" id="code" value={product.code} onChange={handleChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
        <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"></textarea>
        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 px-3 py-1 text-sm bg-sky-900 bg-opacity-50 text-sky-300 rounded-md hover:bg-sky-800 hover:bg-opacity-50 disabled:bg-gray-700 disabled:text-gray-400">
          {isGenerating ? 'جاري الإنشاء...' : 'إنشاء وصف ذكي ✨'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300 mb-1">سعر الشراء</label>
          <input type="number" name="purchasePrice" id="purchasePrice" value={product.purchasePrice} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-300 mb-1">سعر البيع</label>
          <input type="number" name="sellPrice" id="sellPrice" value={product.sellPrice} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">المخزون</label>
          <input type="number" name="stock" id="stock" value={product.stock} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>
       <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">تاريخ انتهاء الصلاحية</label>
            <div className="flex items-center gap-4">
                <input type="checkbox" id="hasExpiry" checked={hasExpiry} onChange={handleExpiryToggle} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"/>
                <label htmlFor="hasExpiry" className="text-gray-300">له تاريخ صلاحية</label>
                <input type="date" name="expiryDate" value={product.expiryDate || ''} onChange={handleChange} disabled={!hasExpiry} className="px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md disabled:bg-gray-700 disabled:text-gray-500" />
            </div>
        </div>
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700 mt-2">
        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500">إلغاء</button>
        <button type="submit" className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">حفظ</button>
      </div>
    </form>
  );
};