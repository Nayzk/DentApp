import React from 'react';
import { Modal } from './Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تواصل معنا" size="md">
      <div className="text-gray-300 space-y-6">
        <p>
          نسعد بتواصلك معنا! يمكنك استخدام المعلومات التالية للاتصال بفريق الدعم.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-sky-900 bg-opacity-50 text-sky-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-200">البريد الإلكتروني</p>
              <a href="mailto:moh.ali541983@gmail.com" className="text-sky-400 hover:text-sky-300">moh.ali541983@gmail.com</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-sky-900 bg-opacity-50 text-sky-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-200">الهاتف</p>
              <a href="tel:01009855113" className="text-sky-400 hover:text-sky-300" dir="ltr">01009855113</a>
            </div>
          </div>
           <div className="flex items-center gap-4">
            <div className="bg-sky-900 bg-opacity-50 text-sky-400 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-200">العنوان</p>
              <p>مركز دير مواس، المنيا، مصر</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};