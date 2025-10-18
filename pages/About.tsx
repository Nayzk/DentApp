
import React, { useState, useEffect } from 'react';

// Define the event type for the PWA installation prompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


export const About: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;

    installPrompt.prompt();

    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  return (
    <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">حول برنامج الاسنانجي</h2>
      <div className="text-lg text-gray-300 space-y-4">
        <p>
            برنامج "الاسنانجي" هو نظام إدارة متكامل مصمم خصيصًا لتلبية احتياجات مستودعات وشركات مستلزمات طب الأسنان في السوق العربي. يهدف البرنامج إلى تبسيط العمليات اليومية وتعزيز الكفاءة من خلال توفير واجهة سهلة الاستخدام باللغة العربية.
        </p>
        <p>
            <strong>المميزات الرئيسية:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2 pr-4">
            <li>إدارة شاملة للأصناف والمخزون.</li>
            <li>نظام متكامل لإدارة المبيعات والفواتير.</li>
            <li>متابعة العملاء والموردين بكل سهولة.</li>
            <li>إصدار أوامر الشراء وتتبعها.</li>
            <li>تقارير تفصيلية لمتابعة أداء العمل.</li>
            <li>
                <strong>وصف ذكي للمنتجات:</strong> باستخدام أحدث تقنيات الذكاء الاصطناعي من Google Gemini، يمكن للبرنامج إنشاء أوصاف تسويقية احترافية لمنتجاتك بنقرة زر واحدة.
            </li>
        </ul>
        <p>
            تم تطوير هذا البرنامج لتوفير أداة قوية وموثوقة تساعد على نمو أعمالك وتنظيمها.
        </p>
      </div>

       {installPrompt && (
        <div className="mt-8 text-center p-6 bg-gray-800 rounded-lg">
          <button
            onClick={handleInstallClick}
            className="px-6 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 shadow-lg transition-transform transform hover:scale-105"
          >
            تثبيت البرنامج على جهازك
          </button>
          <p className="text-sm text-gray-400 mt-2">
            لتجربة استخدام أفضل والوصول السريع دون الحاجة للإنترنت.
          </p>
        </div>
      )}
    </div>
  );
};