import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Edit, Trash2, Check, X, Eye, ExternalLink,
  Upload, Sparkles, RefreshCw, AlertCircle, ArrowRight, Palette, Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import DevToolsColorPicker, { parseColor } from '../ui/DevToolsColorPicker.jsx';

const PRESET_BADGE_COLORS = [
  { id: 'rose', name: 'Rose', bg: 'rgba(244, 63, 94, 0.22)', border: 'rgba(244, 63, 94, 0.55)', text: '#fda4af', hex: '#f43f5e' },
  { id: 'amber', name: 'Amber', bg: 'rgba(245, 158, 11, 0.22)', border: 'rgba(245, 158, 11, 0.55)', text: '#fcd34d', hex: '#f59e0b' },
  { id: 'emerald', name: 'Emerald', bg: 'rgba(16, 185, 129, 0.22)', border: 'rgba(16, 185, 129, 0.55)', text: '#6ee7b7', hex: '#10b981' },
  { id: 'blue', name: 'Sky Blue', bg: 'rgba(59, 130, 246, 0.22)', border: 'rgba(59, 130, 246, 0.55)', text: '#93c5fd', hex: '#3b82f6' },
  { id: 'purple', name: 'Purple', bg: 'rgba(168, 85, 247, 0.22)', border: 'rgba(168, 85, 247, 0.55)', text: '#d8b4fe', hex: '#a855f7' },
  { id: 'coral', name: 'Coral Pink', bg: 'rgba(251, 113, 133, 0.22)', border: 'rgba(251, 113, 133, 0.55)', text: '#fda4af', hex: '#fb7185' },
];

const PRESET_EMOJIS = ['🚚', '🎟️', '⚡', '🩺', '🐾', '🎁', '⭐', '🔥', '📢', '🏷️', '🏨', '✨'];

const BADGE_PRESETS = [
  'HOT OFFER', 'SPECIAL OFFER', 'LIMITED TIME', 'NEW ARRIVAL',
  'WEEKEND SALE', 'FLASH DEAL', 'LIVE EVENT', 'VERIFIED'
];

const LINK_PRESETS = [
  { label: '/shop (Pet Store)', value: '/shop' },
  { label: '/pet-care (Pet Care & Services)', value: '/pet-care' },
  { label: '/hostel (Pet Hostels)', value: '/hostel' },
  { label: '/veterinary (Vet Care)', value: '/veterinary' },
  { label: '/breeding (Ethical Studs)', value: '/breeding' }
];

const CTA_PRESETS = ['Shop Now', 'Claim Offer', 'Learn More', 'Explore', 'Book Vet', 'No button'];

export const getBadgeInlineStyle = (color) => {
  if (!color) color = 'rose';
  const preset = PRESET_BADGE_COLORS.find(p => p.id === color.toLowerCase() || p.hex.toLowerCase() === color.toLowerCase());
  if (preset) {
    return { backgroundColor: preset.bg, borderColor: preset.border, color: preset.text };
  }

  const parsed = parseColor(color);
  const { r, g, b, a } = parsed;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  let textColor;
  if (a >= 0.6) {
    textColor = lum < 0.55 ? '#ffffff' : '#0f172a';
  } else {
    textColor = lum < 0.4 ? '#ffffff' : `rgb(${Math.min(255, r + 75)}, ${Math.min(255, g + 75)}, ${Math.min(255, b + 75)})`;
  }

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${a !== undefined ? a : 0.25})`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0.45, (a !== undefined ? a : 0.25) + 0.3))})`,
    color: textColor
  };
};

const AnnouncementsManagerView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [settings, setSettings] = useState({
    isEnabled: true,
    speed: 'normal',
    pauseOnHover: true
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingItem, setSavingItem] = useState(false);

  // Form Fields
  const [formText, setFormText] = useState('');
  const [formBadge, setFormBadge] = useState('HOT OFFER');
  const [formBadgeColor, setFormBadgeColor] = useState('rose');
  const [customColorInput, setCustomColorInput] = useState('#f43f5e');
  const [formIcon, setFormIcon] = useState('🚚');
  const [formLink, setFormLink] = useState('/shop');
  const [formCtaText, setFormCtaText] = useState('Shop Now');
  const [formOrder, setFormOrder] = useState(1);
  const [formHighlight, setFormHighlight] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/announcements/admin');
      if (res && res.success) {
        setAnnouncements(res.announcements || []);
        if (res.settings) setSettings(res.settings);
      } else {
        // Fallback to public endpoint
        const pub = await apiRequest('/announcements');
        if (pub && pub.success) {
          setAnnouncements(pub.announcements || []);
          if (pub.settings) setSettings(pub.settings);
        }
      }
    } catch (err) {
      console.warn('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notifyChange = () => {
    window.dispatchEvent(new Event('announcements_updated'));
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormText('');
    setFormBadge('HOT OFFER');
    setFormBadgeColor('rose');
    setCustomColorInput('#f43f5e');
    setFormIcon('🚚');
    setFormLink('/shop');
    setFormCtaText('Shop Now');
    setFormOrder(announcements.length + 1);
    setFormHighlight(false);
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormText(item.text || '');
    setFormBadge(item.badge || 'HOT OFFER');
    setFormBadgeColor(item.badgeColor || 'rose');
    setCustomColorInput(item.badgeColor?.startsWith('#') ? item.badgeColor : '#f43f5e');
    setFormIcon(item.icon || '🚚');
    setFormLink(item.link || '/shop');
    setFormCtaText(item.ctaText !== undefined ? item.ctaText : 'Shop Now');
    setFormOrder(item.order ?? 1);
    setFormHighlight(Boolean(item.highlight));
    setFormIsActive(item.isActive !== false);
    setShowModal(true);
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (PNG, JPG, SVG, WEBP) are supported for the icon.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Icon image size must be less than 10MB.');
      return;
    }

    setIsUploadingIcon(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/announcements/upload-icon', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success && data.url) {
        setFormIcon(data.url);
        toast.success('Custom icon image uploaded successfully!');
      } else {
        toast.error(data.message || 'Failed to upload icon image.');
      }
    } catch (err) {
      toast.error(err.message || 'Error uploading icon image.');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!formText.trim()) {
      toast.error('Announcement message text is required.');
      return;
    }

    setSavingItem(true);
    const payload = {
      text: formText.trim(),
      badge: formBadge.trim(),
      badgeColor: formBadgeColor,
      icon: formIcon.trim(),
      link: formLink.trim(),
      ctaText: formCtaText.trim(),
      order: Number(formOrder) || 1,
      highlight: formHighlight,
      isActive: formIsActive
    };

    try {
      if (editingId) {
        const res = await apiRequest(`/announcements/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success('Announcement updated successfully!');
          setShowModal(false);
          loadData();
          notifyChange();
        } else {
          toast.error(res?.message || 'Could not update announcement.');
        }
      } else {
        const res = await apiRequest('/announcements', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success('New announcement added to banner!');
          setShowModal(false);
          loadData();
          notifyChange();
        } else {
          toast.error(res?.message || 'Could not create announcement.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving announcement.');
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleActive = async (item) => {
    const updatedStatus = !item.isActive;
    try {
      const res = await apiRequest(`/announcements/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: updatedStatus })
      });
      if (res && res.success) {
        setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isActive: updatedStatus } : a));
        toast.success(`Announcement ${updatedStatus ? 'activated' : 'paused'}.`);
        notifyChange();
      }
    } catch (err) {
      toast.error('Failed to toggle announcement status.');
    }
  };

  const handleDelete = async (id, text) => {
    if (!window.confirm(`Delete announcement "${text.substring(0, 30)}..."?`)) return;
    try {
      const res = await apiRequest(`/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res && res.success) {
        toast.success('Announcement removed from banner.');
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        notifyChange();
      } else {
        toast.error(res?.message || 'Could not delete announcement.');
      }
    } catch (err) {
      toast.error('Failed to delete announcement.');
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    setSavingSettings(true);
    try {
      const res = await apiRequest('/announcements/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
      if (res && res.success) {
        setSettings(newSettings);
        toast.success('Banner settings updated!');
        notifyChange();
      } else {
        toast.error(res?.message || 'Failed to update settings.');
      }
    } catch (err) {
      toast.error('Error updating banner settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const activeCount = announcements.filter(a => a.isActive !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls Card */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-beige/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <Megaphone size={20} />
              </span>
              <div>
                <h3 className="font-serif text-xl font-bold text-primary">
                  Header Announcement Bar & Offers Ticker
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage the scrolling top promotional banner across all public pages in real time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Refresh announcements list"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <a
              href="/?preview=guest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-[#1c4b3a]/30 hover:bg-[#1c4b3a]/10 text-primary font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open public home page without login in a new tab"
            >
              <ExternalLink size={14} />
              <span>View Live Site</span>
            </a>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={16} /> ADD NEW OFFER
            </button>
          </div>
        </div>

        {/* Global Banner Configuration Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-xs">
          {/* Enable / Disable Switch */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-lg border border-gray-100">
            <div>
              <span className="font-bold text-gray-800 block">Announcement Bar Visibility</span>
              <span className="text-[11px] text-gray-500">
                {settings.isEnabled ? 'Active on all public pages' : 'Hidden from visitors'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdateSettings({ ...settings, isEnabled: !settings.isEnabled })}
              disabled={savingSettings}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.isEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Scroll Speed Selection */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-lg border border-gray-100">
            <div>
              <span className="font-bold text-gray-800 block">Marquee Scroll Speed</span>
              <span className="text-[11px] text-gray-500 capitalize">{settings.speed || 'normal'} Pace</span>
            </div>
            <select
              value={settings.speed || 'normal'}
              onChange={(e) => handleUpdateSettings({ ...settings, speed: e.target.value })}
              disabled={savingSettings}
              className="bg-white border border-gray-200 text-xs font-bold rounded-md px-2.5 py-1 text-primary focus:outline-none focus:border-primary"
            >
              <option value="slow">Slow (35s)</option>
              <option value="normal">Normal (25s)</option>
              <option value="fast">Fast (15s)</option>
            </select>
          </div>

          {/* Pause on Hover Switch */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-lg border border-gray-100">
            <div>
              <span className="font-bold text-gray-800 block">Pause on Hover</span>
              <span className="text-[11px] text-gray-500">
                {settings.pauseOnHover ? 'Stops scroll when cursor hovers' : 'Continuous scroll'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdateSettings({ ...settings, pauseOnHover: !settings.pauseOnHover })}
              disabled={savingSettings}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.pauseOnHover ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.pauseOnHover ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
        <div className="px-5 py-3 bg-[#091D15] text-[#FAFBF9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7CA085]">
              LIVE BANNER SIMULATOR
            </span>
          </div>
          <span className="text-[11px] text-white/60">
            {activeCount} active offer{activeCount === 1 ? '' : 's'} displayed in ticker
          </span>
        </div>

        {/* Mock Top Ticker */}
        <div className="bg-[#091D15] border-t border-white/10 py-2.5 px-4 overflow-hidden relative">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
            {announcements.filter(a => a.isActive !== false).map((anc, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 text-xs text-white shrink-0">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs"
                  style={getBadgeInlineStyle(anc.badgeColor)}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  <span>{anc.badge || 'OFFER'}</span>
                </span>

                <span className="flex items-center gap-1.5 text-[11px]">
                  {anc.icon && (anc.icon.startsWith('/') || anc.icon.startsWith('http') || anc.icon.startsWith('data:')) ? (
                    <img src={anc.icon} alt="icon" className="w-4 h-4 object-contain inline-block align-middle" />
                  ) : (
                    <span>{anc.icon || '📢'}</span>
                  )}
                  <span className={anc.highlight ? 'text-white font-bold' : 'text-gray-200'}>
                    {anc.text}
                  </span>
                </span>

                {anc.ctaText && (
                  <span className="bg-[#D4AF37] text-[#0F241C] text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 shadow-xs">
                    <span>{anc.ctaText}</span>
                    <span>→</span>
                  </span>
                )}
                <span className="text-white/30 text-xs ml-3">•</span>
              </div>
            ))}
            {announcements.filter(a => a.isActive !== false).length === 0 && (
              <p className="text-xs text-white/50 italic py-1">No active announcements. Add one below!</p>
            )}
          </div>
        </div>
      </div>

      {/* Announcements List Table */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
        <div className="p-5 border-b border-beige/40 flex justify-between items-center">
          <div>
            <h4 className="font-serif text-lg font-bold text-primary">All Announcement Offers</h4>
            <p className="text-xs text-gray-500">Order, badge styles, uploaded icons and actions.</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Total Offers: {announcements.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] text-[#7CA085] uppercase tracking-wider text-[10px] font-bold border-b border-beige/40">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Badge Pill</th>
                <th className="py-3 px-4">Icon</th>
                <th className="py-3 px-4">Announcement Text</th>
                <th className="py-3 px-4">Action Link & CTA</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/40">
              {announcements.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                    #{item.order ?? idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-2xs"
                      style={getBadgeInlineStyle(item.badgeColor)}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      <span>{item.badge || 'OFFER'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.icon && (item.icon.startsWith('/') || item.icon.startsWith('http') || item.icon.startsWith('data:')) ? (
                      <img
                        src={item.icon}
                        alt="icon"
                        className="w-6 h-6 object-contain rounded bg-gray-100 p-0.5 border border-gray-200"
                      />
                    ) : (
                      <span className="text-lg">{item.icon || '📢'}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <span className={`block ${item.highlight ? 'font-bold text-primary' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                    {item.highlight && (
                      <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Sparkles size={11} /> Highlighted Text
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-gray-500 block text-[11px]">{item.link || '/shop'}</span>
                      {item.ctaText ? (
                        <span className="inline-block bg-[#D4AF37] text-[#0F241C] text-[9px] font-black px-2 py-0.5 rounded-full">
                          {item.ctaText} →
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">No button</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        item.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isActive !== false ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                      <span>{item.isActive !== false ? 'Active' : 'Paused'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.text)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                    No announcement offers created yet. Click "Add New Offer" to start!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-beige/60 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">
                  {editingId ? 'Edit Announcement Offer' : 'Add New Announcement Offer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveAnnouncement} className="p-6 overflow-y-auto space-y-5 text-xs flex-grow">
              {/* Offer Text */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Announcement Message / Offer Text *
                </label>
                <input
                  type="text"
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. FREE SHIPPING ON ORDERS ABOVE ₹999 or USE CODE 'PAWFIRST' FOR 15% OFF"
                  className="w-full px-3.5 py-2.5 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Badge Label & Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Badge Label (Optional)
                  </label>
                  <span className="text-[10px] text-gray-400">Pill shown before text</span>
                </div>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value.toUpperCase())}
                  placeholder="e.g. HOT OFFER, FLASH SALE"
                  className="w-full px-3.5 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary uppercase font-mono font-bold"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase py-0.5">Presets:</span>
                  {BADGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormBadge(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                        formBadge === preset ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  {formBadge && (
                    <button
                      type="button"
                      onClick={() => setFormBadge('')}
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Badge Color: VS Code / Chrome DevTools Color Picker Tool with Direct Code Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette size={14} className="text-primary" /> Badge Pill Color (Interactive Palette &amp; Code Tool)
                  </label>
                  {/* Live preview swatch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">Live Badge Preview:</span>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs transition-all"
                      style={getBadgeInlineStyle(formBadgeColor)}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      <span>{formBadge || 'PREVIEW'}</span>
                    </span>
                  </div>
                </div>

                {/* Interactive DevTools Color Picker Component */}
                <DevToolsColorPicker
                  value={formBadgeColor}
                  onChange={(newColor) => {
                    setFormBadgeColor(newColor);
                    setCustomColorInput(newColor);
                  }}
                  className="w-full"
                />
              </div>

              {/* Icon / Emoji OR Upload Image */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Icon (Preset Emoji or Upload Image &lt; 10MB)
                </label>

                {/* Preset Emoji Picker */}
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormIcon(emoji)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition cursor-pointer ${
                        formIcon === emoji ? 'border-primary bg-primary/10 scale-105' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Upload Image Option */}
                <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {formIcon && (formIcon.startsWith('/') || formIcon.startsWith('http') || formIcon.startsWith('data:')) ? (
                      <div className="relative group">
                        <img
                          src={formIcon}
                          alt="custom icon"
                          className="w-9 h-9 object-contain rounded-md border border-gray-200 bg-white p-1"
                        />
                        <button
                          type="button"
                          onClick={() => setFormIcon('🚚')}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-sm"
                          title="Remove custom icon image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-2xl p-1 bg-white rounded border border-gray-200">{formIcon || '📢'}</span>
                    )}
                    <div>
                      <span className="font-bold text-gray-700 block">Upload Custom Icon Image</span>
                      <span className="text-[10px] text-gray-400">PNG, SVG, JPG, WEBP (Max 10MB)</span>
                    </div>
                  </div>

                  <label className="btn-secondary-premium !py-1.5 !px-3 !text-[11px] flex items-center gap-1 cursor-pointer">
                    <Upload size={13} />
                    <span>{isUploadingIcon ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      disabled={isUploadingIcon}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action Link & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Action Link URL
                  </label>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="/shop or /services"
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {LINK_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormLink(p.value)}
                        className="text-[10px] text-primary/80 hover:underline cursor-pointer mr-1.5"
                      >
                        {p.value}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    CTA Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="Shop Now, Claim Offer"
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {CTA_PRESETS.map((cta) => (
                      <button
                        key={cta}
                        type="button"
                        onClick={() => setFormCtaText(cta === 'No button' ? '' : cta)}
                        className={`text-[10px] cursor-pointer mr-1.5 ${
                          cta === 'No button' ? 'text-rose-600 hover:underline' : 'text-primary/80 hover:underline'
                        }`}
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Priority & Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Display Priority / Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="formHighlight"
                    checked={formHighlight}
                    onChange={(e) => setFormHighlight(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="formHighlight" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Bold White Highlight
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Active in Live Ticker
                  </label>
                </div>
              </div>

              {/* Live Preview Inside Modal */}
              <div className="bg-[#091D15] p-3 rounded-xl border border-white/10 text-white mt-3">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                  LIVE PREVIEW:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  {formBadge && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs"
                      style={getBadgeInlineStyle(formBadgeColor)}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      <span>{formBadge}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px]">
                    {formIcon && (formIcon.startsWith('/') || formIcon.startsWith('http') || formIcon.startsWith('data:')) ? (
                      <img src={formIcon} alt="icon" className="w-4 h-4 object-contain inline-block" />
                    ) : (
                      <span>{formIcon || '📢'}</span>
                    )}
                    <span className={formHighlight ? 'text-white font-bold' : 'text-gray-200'}>
                      {formText || 'Your offer message will appear here...'}
                    </span>
                  </span>
                  {formCtaText && (
                    <span className="bg-[#D4AF37] text-[#0F241C] text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <span>{formCtaText}</span>
                      <span>→</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingItem ? 'SAVING...' : editingId ? 'UPDATE OFFER' : 'ADD TO TOP BANNER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagerView;

