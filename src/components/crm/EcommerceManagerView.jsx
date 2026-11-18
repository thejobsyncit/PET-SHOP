import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Truck, Package, AlertTriangle, Search, Filter,
  CheckCircle2, Clock, Check, X, RefreshCw, ExternalLink, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const DEMO_SKU_INVENTORY = [
  { sku: 'RC-MAXI-15KG', name: 'Royal Canin Maxi Adult Dog Food (15kg)', category: 'Dog Food', stock: 18, minAlert: 10, price: 8450, status: 'In Stock' },
  { sku: 'DROOLS-PUPPY-12', name: 'Drools Focus Super Premium Puppy Formula', category: 'Dog Food', stock: 4, minAlert: 10, price: 4200, status: 'Low Stock' },
  { sku: 'KONG-CLASSIC-M', name: 'Kong Classic Durable Dental Chew Toy', category: 'Toys & Chews', stock: 42, minAlert: 15, price: 850, status: 'In Stock' },
  { sku: 'CAT-TREE-LUX', name: 'Luxury Multi-tier Wooden Cat Scratching Tree', category: 'Cat Furniture', stock: 2, minAlert: 5, price: 3499, status: 'Low Stock' },
  { sku: 'HEARTGARD-PLUS', name: 'Heartgard Plus Chewable Vet Tablets', category: 'Pharmacy', stock: 8, minAlert: 10, price: 1650, status: 'Low Stock' },
  { sku: 'BIO-GROOM-SHAMP', name: 'Bio-Groom Natural Oatmeal Anti-Itch Shampoo', category: 'Grooming Supplies', stock: 26, minAlert: 8, price: 799, status: 'In Stock' }
];

const EcommerceManagerView = ({ crmToken }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [shippingStage, setShippingStage] = useState('Processing');
  const [updating, setUpdating] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/orders', getHeaders());
      if (res?.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [crmToken]);

  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setShippingStage(order.shippingStatus || 'Processing');
    setTrackingId(order.trackingId || '');
  };

  const handleUpdateShipping = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await apiRequest(`/crm/orders/${selectedOrder.id || selectedOrder._id}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          shippingStatus: shippingStage,
          trackingId: trackingId.trim()
        })
      });
      if (res?.success) {
        toast.success(`Order ${selectedOrder.orderNumber || selectedOrder.id} updated to ${shippingStage}!`);
        setOrders(prev => prev.map(o => (o.id === selectedOrder.id || o._id === selectedOrder._id)
          ? { ...o, shippingStatus: shippingStage, trackingId: trackingId.trim() }
          : o
        ));
        setSelectedOrder(null);
      }
    } catch (err) {
      toast.error('Failed to update order fulfillment');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'ALL' || (o.shippingStatus || 'Pending') === statusFilter;
    const matchesSearch =
      (o.orderNumber || o.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.city || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalGMV = orders.reduce((sum, o) => sum + Number(o.grandTotal || o.totalAmount || 0), 0);
  const avgOrderVal = orders.length > 0 ? Math.round(totalGMV / orders.length) : 0;
  const lowStockCount = DEMO_SKU_INVENTORY.filter(i => i.status === 'Low Stock').length;

  return (
    <div className="space-y-6">
      {/* Top Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Store Gross Merchandise Value (GMV)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">₹{totalGMV.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+18% MoM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Orders Logged
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#D97706]">{orders.length}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Fulfilled by Hub</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Order Value (AOV)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">₹{avgOrderVal.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">High cart size</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            SKU Low Stock Warning
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-rose-600">{lowStockCount} SKUs</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Reorder Needed</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#D97706] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck size={14} /> Order Fulfillment ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory' ? 'bg-[#D97706] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package size={14} /> SKU Inventory & Alerts ({DEMO_SKU_INVENTORY.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'orders' ? 'Search order #, customer...' : 'Search product or SKU...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#D97706]"
          />
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* TAB 1: STORE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  statusFilter === st ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Purchased Items</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Stage</th>
                  <th className="py-3 px-4 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No store orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id || order._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900">{order.orderNumber || order.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{order.customer?.name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400">{order.customer?.city || 'India'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          {order.items?.map((it, idx) => (
                            <span key={idx} className="text-[11px] text-slate-700 font-medium line-clamp-1">
                              • {it.name} <span className="text-slate-400 font-bold">x{it.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{(order.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-700">{order.paymentMethod || 'UPI'}</span>
                          <span className={`text-[10px] font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.shippingStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.shippingStatus === 'Shipped'
                            ? 'bg-sky-100 text-sky-800'
                            : order.shippingStatus === 'Processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.shippingStatus || 'Pending'}
                        </span>
                        {order.trackingId && (
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                            AWB: {order.trackingId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenOrderModal(order)}
                          className="px-2.5 py-1 bg-[#D97706]/10 hover:bg-[#D97706] hover:text-white text-[#D97706] text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Fulfill / AWB
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SKU INVENTORY MONITOR */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Real-time Warehouse SKU Stocks</span>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
              {lowStockCount} items below safety reorder threshold
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4 text-right">Stock Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {DEMO_SKU_INVENTORY.map(item => (
                  <tr key={item.sku} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.sku}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">₹{item.price}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-sm">{item.stock}</span> units
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.minAlert} units</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Low Stock'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULFILLMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">{selectedOrder.orderNumber || selectedOrder.id}</span>
                <h3 className="font-serif font-black text-slate-900 text-base">Update Order Fulfillment</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-800">{selectedOrder.customer?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <strong className="text-slate-800">{selectedOrder.customer?.city}, {selectedOrder.customer?.state}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grand Total:</span>
                  <strong className="text-slate-900 font-mono">₹{(selectedOrder.grandTotal || 0).toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Shipping Stage *
                </label>
                <select
                  value={shippingStage}
                  onChange={(e) => setShippingStage(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D97706] bg-white font-bold"
                >
                  <option value="Processing">Processing (Packaging in warehouse)</option>
                  <option value="Shipped">Shipped (Handed over to courier)</option>
                  <option value="Delivered">Delivered (Completed delivery)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Courier Tracking ID / AWB Number
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. DELHIVERY-98112345 or BLUEDART-882233"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D97706] font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateShipping}
                  className="px-5 py-2 text-xs font-bold bg-[#D97706] hover:bg-[#b86204] text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  {updating ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Fulfillment Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceManagerView;

