
import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import useLocalStorage from '../hooks/useLocalStorage';
import type { User } from '../types';
import { initialUsers } from '../data/initialData';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [userCodeInput, setUserCodeInput] = useState('');
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);

  const handleRegisterAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }

    if (password.length < 6) {
        setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
        return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError('اسم المستخدم هذا موجود بالفعل.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setInfo(`لأغراض العرض، رمز التحقق الخاص بك هو: ${code}`);
    setStep('verify');
  };
  
  const handleVerifyAndCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (userCodeInput === verificationCode) {
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        password,
        role: 'user'
      };
      setUsers([...users, newUser]);
      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
      onRegisterSuccess();
    } else {
      setError('رمز التحقق غير صحيح. حاول مرة أخرى.');
    }
  };

  const renderFormStep = () => (
     <form className="space-y-6" onSubmit={handleRegisterAttempt}>
       <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-gray-300 mb-2">اسم المستخدم</label>
            <input id="reg-username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
            <input id="reg-password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">تأكيد كلمة المرور</label>
            <input id="confirm-password" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"/>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500">
              إنشاء حساب
            </button>
        </div>
     </form>
  );
  
  const renderVerifyStep = () => (
     <form className="space-y-6" onSubmit={handleVerifyAndCreate}>
        {info && <p className="text-green-400 text-sm text-center bg-green-900 bg-opacity-30 p-3 rounded-lg">{info}</p>}
        <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-300 mb-2">رمز التحقق</label>
            <input id="verification-code" name="verificationCode" type="text" required value={userCodeInput} onChange={(e) => setUserCodeInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-center tracking-[0.5em]"
              placeholder="------"
            />
        </div>
       {error && <p className="text-red-400 text-sm text-center">{error}</p>}
       <div>
         <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500">
           تأكيد وإنشاء الحساب
         </button>
       </div>
     </form>
  );

  return (
    <div className="flex items-center justify-center h-screen bg-black text-slate-300" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl shadow-2xl">
        <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
                <Logo width={60} height={60} />
                <h1 className="text-4xl font-bold text-white tracking-wider">إنشاء حساب</h1>
            </div>
            <p className="text-gray-400">
                {step === 'form' ? 'أدخل بياناتك لإنشاء حساب جديد.' : 'أدخل رمز التحقق لإكمال التسجيل.'}
            </p>
        </div>
        
        {step === 'form' ? renderFormStep() : renderVerifyStep()}

        <p className="mt-6 text-center text-sm text-gray-400">
          لديك حساب بالفعل؟{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};