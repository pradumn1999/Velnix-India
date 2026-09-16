import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Download,
  HelpCircle,
  Copy,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderStatusBadge } from '../components/order/OrderStatusBadge';
import { OrderTrackingTimeline } from '../components/order/OrderTrackingTimeline';
import { Button } from '../components/common/Button';
import { formatINR } from '../utils/formatters';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, orders } = useOrders();
  const { showToast } = useToast();

  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-neutral-500 mb-6">
          The requested order does not exist or has been removed.
        </p>
        <Link to="/orders">
          <Button variant="primary">View All Orders</Button>
        </Link>
      </div>
    );
  }

  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      showToast(`Tracking number ${order.trackingNumber} copied!`, 'info');
    }
  };

  const handleDownloadInvoice = () => {
    showToast(`Invoice PDF generated for order #${order.id}`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: 'My Orders', href: '/orders' },
          { label: `Order #${order.id}` },
        ]}
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-950 font-mono">
              {order.id}
            </h1>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-normal">
            Placed on {order.orderDate} • Paid via {order.paymentMethod}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full font-bold"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadInvoice}
          >
            Invoice
          </Button>
          <Link to="/orders">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full font-bold"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Tracking Details Banner */}
      {order.trackingNumber && (
        <div className="p-5 sm:p-6 bg-neutral-950 text-white rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400">
                  Express Courier:
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {order.courierPartner || 'Delhivery Express'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-neutral-300 font-mono">
                  AWB: {order.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1 hover:text-amber-400 text-neutral-400 cursor-pointer transition-colors"
                  aria-label="Copy tracking code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400 block font-medium">Estimated Arrival</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-400">
              {order.estimatedDelivery}
            </span>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-extrabold text-neutral-950 tracking-tight">
              Live Shipment Progress
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Synced with CJdropshipping Fulfillment & Pan-India Domestic Couriers
            </p>
          </div>

          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            Status Refreshed: Just now
          </span>
        </div>

        <div className="pt-6">
          <OrderTrackingTimeline
            currentStatus={order.orderStatus}
            trackingNumber={order.trackingNumber}
            courierPartner={order.courierPartner}
            checkpoints={order.trackingCheckpoints}
            estimatedDeliveryDate={order.estimatedDelivery}
          />
        </div>
      </div>

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Ordered Items List (7 cols) */}
        <div className="md:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider pb-3 border-b border-neutral-100">
            Shipment Items ({order.items.length})
          </h3>

          <div className="divide-y divide-neutral-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-16 object-cover rounded-2xl border border-neutral-200/80 bg-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      Qty: <span className="font-bold text-neutral-900">{item.quantity}</span>
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span key={k} className="ml-2 font-medium">
                          • {k}: {v}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-900 mt-1">
                      {formatINR(item.product.price)} each
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-black text-neutral-950 shrink-0">
                  {formatINR(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Payment Breakdown (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-950 uppercase tracking-wider pb-2 border-b border-neutral-100">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>Shipping Destination</span>
            </div>

            <div className="text-xs text-neutral-700 leading-relaxed">
              <p className="font-extrabold text-neutral-950 text-sm mb-1">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.addressLine}</p>
              {order.shippingAddress.landmark && (
                <p>Near {order.shippingAddress.landmark}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} –{' '}
                <strong className="text-neutral-950">{order.shippingAddress.pincode}</strong>
              </p>
              <p className="mt-2 text-neutral-500">Phone: {order.shippingAddress.mobile}</p>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-950 uppercase tracking-wider pb-2 border-b border-neutral-100">
              <CreditCard className="w-4 h-4 text-neutral-500" />
              <span>Payment Details</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Payment Method</span>
                <span className="font-bold text-neutral-950">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Payment Status</span>
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-950">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- {formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-700">
                  {order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200/80 flex justify-between items-baseline font-extrabold text-neutral-950 text-sm">
                <span>Total Amount Paid</span>
                <span className="text-base font-black">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer Support CTA */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-700 font-medium">Need delivery assistance?</span>
            </div>
            <button
              onClick={() => showToast('Support ticket raised for Order #' + order.id, 'info')}
              className="font-bold text-neutral-950 hover:underline cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
