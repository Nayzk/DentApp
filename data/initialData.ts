
import type { Product, Customer, Supplier, User } from '../types';

// Helper function to get date string for future dates
const getDateInFuture = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'مجموعة أدوات فحص الأسنان',
    code: 'D-KIT-001',
    description: 'مجموعة أساسية للفحص تتضمن مرآة، مسبار، وملقط.',
    purchasePrice: 150,
    sellPrice: 250,
    stock: 50,
    expiryDate: null,
  },
  {
    id: 'prod-2',
    name: 'كمبوزيت حشوات نانو',
    code: 'COMP-N-010',
    description: 'كمبوزيت عالي الجودة لحشوات تجميلية متينة.',
    purchasePrice: 450,
    sellPrice: 600,
    stock: 30,
    expiryDate: getDateInFuture(365), // Expires in one year
  },
  {
    id: 'prod-3',
    name: 'قفازات لاتكس طبية (100 قطعة)',
    code: 'GLV-L-100',
    description: 'علبة قفازات لاتكس للاستخدام مرة واحدة، غير معقمة.',
    purchasePrice: 40,
    sellPrice: 65,
    stock: 200,
    expiryDate: getDateInFuture(730), // Expires in two years
  },
  {
    id: 'prod-4',
    name: 'مادة طبعات سيليكونية',
    code: 'IMP-S-025',
    description: 'مادة طبعات عالية الدقة لتيجان وجسور الأسنان.',
    purchasePrice: 800,
    sellPrice: 1100,
    stock: 15,
    expiryDate: getDateInFuture(25), // Expiring soon
  },
    {
    id: 'prod-5',
    name: 'أقماع ورقية لـ Gutta-percha',
    code: 'GPC-001',
    description: 'أقماع ورقية ماصة تستخدم في علاج الجذور.',
    purchasePrice: 90,
    sellPrice: 150,
    stock: 8,
    expiryDate: getDateInFuture(-10), // Expired
  }
];

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'عيادة د. أحمد محمود', phone: '01234567890', address: '123 شارع النصر, القاهرة' },
  { id: 'cust-2', name: 'مركز ابتسامة لطب الأسنان', phone: '01098765432', address: '45 شارع الجمهورية, الإسكندرية' },
];

export const initialSuppliers: Supplier[] = [
  { id: 'supp-1', name: 'شركة التجهيزات الطبية المتحدة', phone: '0223344556', address: 'المنطقة الصناعية, مدينة نصر' },
  { id: 'supp-2', name: 'مستوردون لمستلزمات الأسنان', phone: '0345566778', address: 'ميناء الإسكندرية, الإسكندرية' },
];

export const initialUsers: User[] = [
    { id: 'user-1', username: 'admin', password: 'password', role: 'admin' },
    { id: 'user-2', username: 'user', password: 'password', role: 'user' }
];