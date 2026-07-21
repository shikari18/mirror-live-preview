export function MobileStatusBar() {
  return (
    <div className="w-full flex items-center justify-between px-7 pt-3 pb-2 text-[14px] font-semibold text-gray-900 select-none z-10">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal Bars */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="16" width="3" height="5" rx="0.5" />
          <rect x="7" y="12" width="3" height="9" rx="0.5" />
          <rect x="12" y="8" width="3" height="13" rx="0.5" />
          <rect x="17" y="4" width="3" height="17" rx="0.5" />
        </svg>
        {/* Wifi */}
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18c-.8 0-1.5.7-1.5 1.5S11.2 21 12 21s1.5-.7 1.5-1.5S12.8 18 12 18zm-5-3.5c1.4-1.3 3.1-2 5-2s3.6.7 5 2l1.5-1.5c-1.8-1.7-4.1-2.6-6.5-2.6s-4.7.9-6.5 2.6L7 14.5zm-4-4c2.5-2.3 5.7-3.6 9-3.6s6.5 1.3 9 3.6l1.5-1.5C19.7 6.4 16 5 12 5S4.3 6.4 1.5 9L3 10.5z" />
        </svg>
        {/* Battery */}
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="7" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="4" y="9" width="10" height="6" rx="1" />
          <path d="M20 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
