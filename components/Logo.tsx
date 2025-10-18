
import React from 'react';

export const Logo: React.FC<{ width?: number, height?: number }> = ({ width = 40, height = 40 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop stopColor="#38bdf8"/>
                <stop offset="1" stopColor="#0ea5e9"/>
            </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" d="M8.41641 2.9999C9.21321 2.9999 9.87841 3.4395 10.1585 4.1001L11.166 6.5C11.3533 6.94236 11.7575 7.25 12.222 7.25C12.6865 7.25 13.0907 6.94236 13.278 6.5L14.2855 4.1001C14.5656 3.4395 15.2308 2.9999 16.0276 2.9999H17.25C18.2165 2.9999 19 3.7834 19 4.7499V10.25C19 13.25 17.5 15.5 15.25 17.0193V18.75C15.25 20.2688 14.0188 21.5 12.5 21.5H12.25H12H11.75C10.2312 21.5 9 20.2688 9 18.75V17.0193C6.75 15.5 5.25 13.25 5.25 10.25V4.7499C5.25 3.7834 6.0335 2.9999 7 2.9999H8.41641Z" fill="url(#logoGradient)"/>
    </svg>
);