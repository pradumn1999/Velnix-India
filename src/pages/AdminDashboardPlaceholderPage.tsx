import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Package,
  ShoppingCart,
  Zap,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck,
  DollarSign,
  CreditCard,
  Plus,
  ExternalLink,
  ShieldCheck,
  Clock,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { formatINR } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Product, Order, OrderStatus } from '../types';

export const AdminDashboardPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { orders: contextOrders, updateOrderStatus, refreshOrders } = useOrders();

  const subRoute = location.pathname.split('/')[2] || 'overview';

  // Stats state
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    cjSyncStatus: 'Active',
    lastSyncTime: new Date().toISOString(),
  });

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSyncingCJ, setIsSyncingCJ] = useState(false);

  // New CJ Product Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCjId, setImportCjId] = useState('CJ-TECH-9921');
  const [importPrice, setImportPrice] = useState('1499');
  const [isImporting, setIsImporting] = useState(false);

  // CJ Dropshipping status state
  const [cjStatus, setCjStatus] = useState<any>(null);
  const [calcPin, setCalcPin] = useState('560103');
  const [calcWeight, setCalcWeight] = useState('450');
  const [freightResult, setFreightResult] = useState<any>(null);
  const [isCalculatingFreight, setIsCalculatingFreight] = useState(false);

  // Razorpay status state
  const [razorpayConfig, setRazorpayConfig] = useState<any>(null);

  // Selected order for status update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Load initial backend data
  const loadDashboardData = async () => {
    try {
      const [statsRes, productsRes, cjRes, rzpRes] = await Promise.all([
        api.getStats().catch(() => null),
        api.getProducts().catch(() => null),
        api.getCJStatus().catch(() => null),
        api.getRazorpayConfig().catch(() => null),
      ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (productsRes?.success) setProducts(productsRes.products);
      if (cjRes?.success) setCjStatus(cjRes.data);
      if (rzpRes?.success) setRazorpayConfig(rzpRes);
    } catch (err) {
      console.warn('Could not load all admin dashboard endpoints', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user?.role]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto text-neutral-300" />
        <h1 className="mt-5 text-2xl font-black text-neutral-950">Admin access required</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sign in with an admin account to manage products, orders, and fulfillment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate(isAuthenticated ? '/buyer' : '/login')}>
            {isAuthenticated ? 'Go to Buyer Panel' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  // Handle CJ Inventory Sync
  const handleSyncCJInventory = async () => {
    setIsSyncingCJ(true);
    try {
      const res = await api.syncCJInventory();
      if (res && res.success) {
        showToast(res.message || 'CJdropshipping stock synchronized!', 'success');
        await loadDashboardData();
      } else {
        showToast('Failed to sync CJ inventory', 'error');
      }
    } catch (err) {
      showToast('Error communicating with CJdropshipping gateway', 'error');
    } finally {
      setIsSyncingCJ(false);
    }
  };

  // Handle CJ Product Import
  const handleImportProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCjId.trim() || !importPrice) {
      showToast('Please enter a CJ Product ID and retail price', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const res = await api.importCJProduct(importCjId, Number(importPrice));
      if (res && res.success) {
        showToast(res.message, 'success');
        setShowImportModal(false);
        await loadDashboardData();
      } else {
        showToast('Failed to import product from CJdropshipping', 'error');
      }
    } catch (err) {
      showToast('Error during product import', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const success = await updateOrderStatus(orderId, nextStatus);
      if (success) {
        showToast(`Order #${orderId} marked as ${nextStatus}`, 'success');
        await refreshOrders();
        await loadDashboardData();
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (err) {
      showToast('Error updating order', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Freight Calculation
  const handleCalculateFreight = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculatingFreight(true);
    try {
      const res = await api.calculateFreight(calcPin, Number(calcWeight));
      if (res && res.success) {
        setFreightResult(res.data);
      }
    } catch (err) {
      showToast('Failed to calculate freight rate', 'error');
    } finally {
      setIsCalculatingFreight(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: 'Admin Portal', href: '/admin' },
          { label: subRoute.charAt(0).toUpperCase() + subRoute.slice(1) },
        ]}
      />

      {/* Admin Portal Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Phase 2 Live: Node.js Express + CJ API + Razorpay
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Velnix Admin & Fulfillment Center
            </h1>
            <p className="text-xs text-neutral-500">
              Manage live product inventory, monitor CJdropshipping automated dispatch, and advance customer shipments
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isSyncingCJ}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleSyncCJInventory}
            >
              Sync CJ Stock
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowImportModal(true)}
            >
              Import CJ SKU
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-neutral-200 pb-2 text-xs">
          {[
            { id: 'overview', label: 'Overview', href: '/admin' },
            { id: 'orders', label: `Orders (${contextOrders.length})`, href: '/admin/orders' },
            { id: 'products', label: `Products Sync (${products.length})`, href: '/admin/products' },
            { id: 'cjdropshipping', label: 'CJdropshipping API', href: '/admin/cjdropshipping' },
          ].map((tab) => (
            <Link
              key={tab.id}
              to={tab.href}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors shrink-0 ${
                subRoute === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {subRoute === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 text-xs">
                <span>Total Store GMV</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">
                {formatINR(stats.totalRevenue || 0)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Across {stats.totalOrders} live orders</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 text-xs">
                <span>Total Orders</span>
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">
                {contextOrders.length}
              </div>
              <div className="text-[11px] text-neutral-500 font-medium mt-1">
                {stats.activeOrders} active • {stats.deliveredOrders} delivered
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 text-xs">
                <span>CJ Sourced Catalog</span>
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-neutral-900 mt-2">
                {products.length} Items
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auto-Inventory Sync Active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-500 text-xs">
                <span>CJdropshipping Gateway</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg font-black text-neutral-900 mt-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Connected</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                BlueDart & Delhivery Priority
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Recent Customer Orders</h2>
              <Link to="/admin/orders" className="text-xs font-bold text-neutral-900 hover:underline">
                View All Orders →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 pb-2">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Destination</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Fulfillment Status</th>
                    <th className="pb-3 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {contextOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-bold text-neutral-900">{order.id}</td>
                      <td className="py-3 text-neutral-700">
                        <div>{order.shippingAddress.fullName}</div>
                        <div className="text-[11px] text-neutral-400">{order.shippingAddress.mobile}</div>
                      </td>
                      <td className="py-3 text-neutral-600">
                        {order.shippingAddress.city}, {order.shippingAddress.pincode}
                      </td>
                      <td className="py-3 font-bold text-neutral-900">{formatINR(order.totalAmount)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 font-semibold text-neutral-800 border border-neutral-200 text-[11px]">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/track-order/${order.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          <span>Live Tracking</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & FULFILLMENT */}
      {subRoute === 'orders' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Live Dropshipping Order Queue</h2>
              <p className="text-xs text-neutral-500">
                Advance order lifecycle checkpoints to simulate real-time BlueDart & Delhivery dispatch
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshOrders()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Orders
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {contextOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col gap-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-neutral-900">{order.id}</span>
                    <span className="text-xs text-neutral-500">• {order.orderDate}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus} ({order.paymentMethod.split(' ')[0]})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Current Status:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-bold">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Middle Grid: Items + Destination + Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Items */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-neutral-800">Items ({order.items.length})</span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-8 h-8 object-cover rounded border border-neutral-200"
                        />
                        <span className="text-neutral-700 truncate font-medium">
                          {item.quantity}x {item.product.name}
                        </span>
                      </div>
                    ))}
                    <div className="font-bold text-neutral-900 mt-1">
                      Total: {formatINR(order.totalAmount)}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-neutral-800">Recipient & Delivery</span>
                    <p className="text-neutral-700 font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-neutral-500">{order.shippingAddress.addressLine}</p>
                    <p className="text-neutral-500">
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                    <p className="text-neutral-600 font-medium">Phone: {order.shippingAddress.mobile}</p>
                  </div>

                  {/* Courier & AWB */}
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-neutral-800">CJ Logistics Sourcing</span>
                    <p className="text-neutral-700">Courier: <strong>{order.tracking.courierPartner}</strong></p>
                    <p className="text-neutral-700">AWB: <code className="bg-white px-1 py-0.5 rounded border border-neutral-200">{order.tracking.trackingNumber}</code></p>
                    <p className="text-neutral-500">ETA: {order.tracking.estimatedDeliveryDate}</p>
                    <Link
                      to={`/track-order/${order.id}`}
                      className="text-blue-600 hover:underline font-semibold mt-1 inline-flex items-center gap-1"
                    >
                      <span>Customer View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Fulfillment Status Transition Buttons */}
                <div className="pt-3 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Advance Courier Milestones:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        'Processing',
                        'Shipped',
                        'In Transit',
                        'Out for Delivery',
                        'Delivered',
                      ] as OrderStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={order.orderStatus === st || updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                          order.orderStatus === st
                            ? 'bg-neutral-900 text-white border-neutral-900 opacity-50 cursor-default'
                            : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        → {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS SYNC */}
      {subRoute === 'products' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">CJdropshipping Catalog Sync</h2>
              <p className="text-xs text-neutral-500">
                Synchronized inventory levels, CJ Product IDs, and profit margins in Indian Rupee
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter catalog..."
                  className="pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:border-neutral-900 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowImportModal(true)}
              >
                Add CJ SKU
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 pb-2">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">SKU / CJ ID</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Retail Price</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold">Sync Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-neutral-200"
                        />
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1 max-w-xs">{p.name}</p>
                          <p className="text-[11px] text-neutral-400">{p.shippingInfo.estimatedDays}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-mono text-neutral-800">{p.sku}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{p.cjProductId || 'CJ-SYNCED'}</div>
                    </td>
                    <td className="py-3 capitalize text-neutral-600">{p.category}</td>
                    <td className="py-3 font-bold text-neutral-900">{formatINR(p.price)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.stock < 10
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live Sync</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/product/${p.id}`}
                        className="text-xs font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        View in Store →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CJ DROPSHIPPING API & FREIGHT CALCULATOR */}
      {subRoute === 'cjdropshipping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: API Status & Config (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-neutral-900">CJdropshipping API Gateway Status</h2>
              <p className="text-xs text-neutral-500">Live operational metrics of supplier endpoints</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-1">
                <span className="text-neutral-500 text-[11px]">API Connection</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {cjStatus?.status || 'ONLINE'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-1">
                <span className="text-neutral-500 text-[11px]">Operating Mode</span>
                <span className="font-bold text-neutral-900">{cjStatus?.mode || 'SANDBOX_SIMULATOR'}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-1">
                <span className="text-neutral-500 text-[11px]">Sourcing Wallet</span>
                <span className="font-bold text-neutral-900">
                  {formatINR(cjStatus?.walletBalanceINR || 48500)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800">Warehouse Transit Hub</span>
                <span className="text-neutral-500 font-mono text-[11px]">Gurugram, HR (Primary Line)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800">Courier Line Partners</span>
                <span className="text-neutral-500">BlueDart Air • Delhivery • Shadowfax</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-800">Last Catalog Check</span>
                <span className="text-neutral-500">{new Date(stats.lastSyncTime).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="primary"
                size="sm"
                isLoading={isSyncingCJ}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleSyncCJInventory}
              >
                Trigger Manual Sync
              </Button>
              <span className="text-[11px] text-neutral-400">Syncs inventory & stock counts</span>
            </div>
          </div>

          {/* Right Column: Indian PIN Code Freight Calculator (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Indian PIN Code Freight Calculator</h2>
              <p className="text-xs text-neutral-500">Query live courier rate tier and delivery TAT</p>
            </div>

            <form onSubmit={handleCalculateFreight} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Destination Indian PIN Code</label>
                <input
                  type="text"
                  value={calcPin}
                  onChange={(e) => setCalcPin(e.target.value)}
                  placeholder="e.g. 560103, 110001, 400001"
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Gross Weight (Grams)</label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isCalculatingFreight}
                leftIcon={<Truck className="w-3.5 h-3.5" />}
              >
                Check Shipping Rate
              </Button>
            </form>

            {freightResult && (
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Region:</span>
                  <span>{freightResult.city} ({freightResult.pincode})</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Assigned Courier:</span>
                  <span>{freightResult.courier}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated TAT:</span>
                  <span>{freightResult.estimatedDays} Business Days</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Calculated Freight:</span>
                  <span>{freightResult.shippingFeeINR === 0 ? 'FREE (Store Subsidized)' : formatINR(freightResult.shippingFeeINR)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Import CJ SKU */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-neutral-200 shadow-xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-neutral-900">Import Dropshipped SKU from CJ</h3>
            <p className="text-xs text-neutral-500">
              Provide the CJ product identifier and desired Indian retail selling price
            </p>

            <form onSubmit={handleImportProduct} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">CJ Product ID / SKU</label>
                <input
                  type="text"
                  required
                  value={importCjId}
                  onChange={(e) => setImportCjId(e.target.value)}
                  placeholder="e.g. CJ-CHARGER-15W"
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700">Target Retail Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  placeholder="1499"
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isImporting}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Import to Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
