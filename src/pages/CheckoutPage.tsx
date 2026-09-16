import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Plus,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShippingAddress } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { AddressCard } from '../components/profile/AddressCard';
import { formatINR } from '../utils/formatters';
import { api } from '../services/api';
import { RazorpayModal } from '../components/checkout/RazorpayModal';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, shipping, grandTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user, addAddress } = useAuth();
  const { showToast } = useToast();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses.find((a) => a.isDefault)?.id || user?.addresses[0]?.id || ''
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    !user?.addresses || user.addresses.length === 0
  );

  // New Address Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560103');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Payment Method & Modal State
  const [paymentMethod, setPaymentMethod] = useState<
    'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)'
  >('Razorpay Online (UPI/Cards)');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [activeRazorpayOrderId, setActiveRazorpayOrderId] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  // If cart is empty, redirect to cart page
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">No Items in Checkout</h2>
        <p className="text-xs text-neutral-500 mb-6">
          Your cart is currently empty. Please add items before proceeding to checkout.
        </p>
        <Link to="/products">
          <Button variant="primary">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim() || !addressLine.trim() || !pincode.trim()) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      showToast('Enter a valid 6-digit PIN code', 'error');
      return;
    }

    setShowNewAddressForm(false);
    showToast('Address selected for this order', 'success');
  };

  const getSelectedShippingAddress = (): ShippingAddress => {
    const existing = user?.addresses.find((a) => a.id === selectedAddressId);
    if (existing) return existing;

    return {
      id: 'addr-adhoc',
      fullName: fullName || 'Valued Customer',
      mobile: mobile || '+91 98765 43210',
      addressLine: addressLine || 'Flat 402, High Street',
      landmark,
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode: pincode || '560103',
      type: addressType,
      isDefault: true,
    };
  };

  const saveAddressForOrder = async (address: ShippingAddress) => {
    const selectedExistingAddress = user?.addresses.some((item) => item.id === selectedAddressId);
    if (selectedExistingAddress) return;

    const { id: _addressId, ...addressToSave } = address;
    await addAddress({
      ...addressToSave,
      isDefault: (user?.addresses.length || 0) === 0,
    });
  };

  const handleRazorpaySuccess = async (paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setIsProcessing(true);
    const chosenAddress = getSelectedShippingAddress();
    try {
      await api.verifyRazorpayPayment(paymentDetails);
      await saveAddressForOrder(chosenAddress);
      const order = await createOrder({
        customerEmail: user?.email || '',
        items: [...cart],
        subtotal,
        shipping,
        discount,
        totalAmount: grandTotal,
        paymentMethod: 'Razorpay Online (UPI/Cards)',
        paymentStatus: 'Paid',
        shippingAddress: chosenAddress,
      });

      setIsRazorpayModalOpen(false);
      clearCart();
      setIsProcessing(false);
      showToast(`Payment Verified! Order #${order.id} placed successfully.`, 'success');
      navigate(`/track-order/${order.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      showToast('Payment verification failed. Please contact support.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    const chosenAddress = getSelectedShippingAddress();
    if (!chosenAddress.fullName || !chosenAddress.addressLine || !chosenAddress.pincode) {
      showToast('Please select or fill a delivery address', 'error');
      return;
    }

    if (paymentMethod === 'Razorpay Online (UPI/Cards)') {
      setIsProcessing(true);
      try {
        const res = await api.createRazorpayOrder(grandTotal, `rcpt_${Date.now()}`);
        if (res && res.success) {
          setActiveRazorpayOrderId(res.order.id);
          setRazorpayKeyId(res.keyId);
          setIsRazorpayModalOpen(true);
        } else {
          showToast('Failed to initialize Razorpay checkout', 'error');
        }
      } catch (err) {
        showToast('Payment gateway temporarily unreachable', 'error');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Cash on Delivery flow
    setIsProcessing(true);
    try {
      await saveAddressForOrder(chosenAddress);
      const order = await createOrder({
        customerEmail: user?.email || '',
        items: [...cart],
        subtotal,
        shipping,
        discount,
        totalAmount: grandTotal,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'Pending',
        shippingAddress: chosenAddress,
      });

      clearCart();
      setIsProcessing(false);
      showToast(`COD Order #${order.id} placed successfully!`, 'success');
      navigate(`/track-order/${order.id}`);
    } catch (err) {
      setIsProcessing(false);
      showToast('Failed to place order. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
      <Breadcrumb
        items={[{ label: 'Bag', href: '/cart' }, { label: 'Secure Checkout' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Checkout & Order Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
            Express automated Pan-India fulfillment with end-to-end courier milestone tracking
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80 self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: 1. Delivery Address + 2. Order Summary + 3. Payment Method (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Section 1: Delivery Address */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-950 text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-base font-extrabold text-neutral-950 tracking-tight">
                  Delivery Address
                </h2>
              </div>

              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-neutral-950 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {user?.addresses && user.addresses.length > 0 && !showNewAddressForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedAddressId === addr.id}
                    onSelect={() => setSelectedAddressId(addr.id)}
                    showActions={false}
                  />
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pradumn Mandal"
                      className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-800">Street Address & Flat/House No. *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Flat 402, Royal Palms Residency, Bellandur"
                    className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near EcoSpace Park"
                      className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="6-digit PIN"
                      className="px-4 py-2.5 border border-neutral-300 rounded-xl focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
                          addressType === type
                            ? 'bg-neutral-950 text-white border-neutral-950'
                            : 'border-neutral-300 text-neutral-700 hover:border-neutral-950'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.addresses && user.addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" variant="primary" size="sm" className="font-bold">
                      Save Address
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Order Items Summary */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-950 text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-base font-extrabold text-neutral-950 tracking-tight">
                  Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h2>
              </div>
              <Link to="/cart" className="text-xs font-bold text-neutral-600 hover:text-neutral-950">
                Edit Bag
              </Link>
            </div>

            <div className="divide-y divide-neutral-100">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover rounded-xl border border-neutral-200/80 bg-neutral-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-neutral-950 line-clamp-1">
                        {item.product.name}
                      </span>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Qty: {item.quantity}
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span key={k} className="ml-2 font-medium">
                            • {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-neutral-950 shrink-0">
                    {formatINR(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-950 text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-base font-extrabold text-neutral-950 tracking-tight">
                  Payment Method
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
                <span>Direct Gateway Integration</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Razorpay Online */}
              <label
                className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay Online (UPI/Cards)'
                    ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === 'Razorpay Online (UPI/Cards)'}
                  onChange={() => setPaymentMethod('Razorpay Online (UPI/Cards)')}
                  className="mt-1 text-neutral-950 focus:ring-neutral-950"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-neutral-950">
                      Razorpay Online Payment (UPI / Cards / NetBanking)
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Instant Dispatch
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Pay instantly using Google Pay, PhonePe, Paytm, BHIM, Visa/Mastercard/RuPay cards, or NetBanking.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-neutral-200/60 text-[10px] font-bold text-neutral-700">
                    <span className="bg-white px-2.5 py-0.5 rounded-full border border-neutral-200">UPI QR</span>
                    <span className="bg-white px-2.5 py-0.5 rounded-full border border-neutral-200">PhonePe / GPay</span>
                    <span className="bg-white px-2.5 py-0.5 rounded-full border border-neutral-200">Cards (RuPay/Visa/Master)</span>
                    <span className="bg-white px-2.5 py-0.5 rounded-full border border-neutral-200">NetBanking</span>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery (COD)'
                    ? 'border-neutral-950 bg-neutral-50/70 ring-1 ring-neutral-950'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  checked={paymentMethod === 'Cash on Delivery (COD)'}
                  onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                  className="mt-1 text-neutral-950 focus:ring-neutral-950"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-neutral-950">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-medium text-neutral-500">Doorstep Collection</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Pay cash or scan the courier delivery agent's UPI QR when the package reaches your doorstep.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: 4. Price Details (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 sticky top-28">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-5">
            <h3 className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider pb-3 border-b border-neutral-100">
              Price Details
            </h3>

            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Product Subtotal</span>
                <span className="font-bold text-neutral-950">{formatINR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Express Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-bold text-emerald-700 uppercase">FREE</span>
                  ) : (
                    formatINR(shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200/80 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-extrabold text-neutral-950">Total Payable</span>
                <span className="text-xl font-black text-neutral-950">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold shadow-md min-h-[48px]"
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={handlePlaceOrder}
            >
              {paymentMethod === 'Cash on Delivery (COD)'
                ? 'Confirm COD Order'
                : `Pay ${formatINR(grandTotal)} via Razorpay`}
            </Button>

            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5 text-[11px] text-neutral-500 font-normal">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span>Standard Pan-India Delivery: 2-4 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>CJdropshipping Verified Dispatch & 7-Day Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        orderId={activeRazorpayOrderId}
        keyId={razorpayKeyId}
        amount={grandTotal}
        customerName={getSelectedShippingAddress().fullName}
        customerEmail={user?.email || 'customer@velnix.in'}
        customerPhone={getSelectedShippingAddress().mobile}
        onSuccess={handleRazorpaySuccess}
        onClose={() => setIsRazorpayModalOpen(false)}
      />
    </div>
  );
};
