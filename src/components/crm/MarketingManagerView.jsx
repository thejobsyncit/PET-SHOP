import React, { useState, useEffect } from 'react';
import { Tag, Megaphone, BookOpen } from 'lucide-react';
import AnnouncementsManagerView from '../dashboards/AnnouncementsManagerView.jsx';
import CouponsManagerView from '../dashboards/CouponsManagerView.jsx';
import BlogsManagerView from '../dashboards/BlogsManagerView.jsx';

const MarketingManagerView = ({ activeSubTab = 'coupons', onTabChange }) => {
  const [activeTab, setActiveTab] = useState(activeSubTab || 'coupons'); // 'coupons' | 'announcements' | 'blogs'

  useEffect(() => {
    if (activeSubTab) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className="space-y-6">
      {/* Top Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Discount Codes
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#EC4899]">Live Storewide</span>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">Automated</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Campaign Sales Revenue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">₹1,43,050</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24% Promo ROI</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Live Header Ticker & Blogs
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">Active</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Real-time</span>
          </div>
        </div>
      </div>

      {/* Tabs & Navigation */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabClick('coupons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'coupons' ? 'bg-[#EC4899] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag size={14} /> Codes & Discounts Manager
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('announcements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'announcements' ? 'bg-[#EC4899] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone size={14} /> Announcement Bar
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('blogs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'blogs' ? 'bg-[#EC4899] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={14} /> Pet Care Blogs
          </button>
        </div>
      </div>

      {/* TAB 1: PROMOTIONAL CODES & DISCOUNTS MANAGER */}
      {activeTab === 'coupons' && (
        <CouponsManagerView />
      )}

      {/* TAB 2: ANNOUNCEMENT BAR TICKER */}
      {activeTab === 'announcements' && (
        <AnnouncementsManagerView />
      )}

      {/* TAB 3: PET CARE BLOGS & ARTICLES */}
      {activeTab === 'blogs' && (
        <BlogsManagerView />
      )}
    </div>
  );
};

export default MarketingManagerView;
