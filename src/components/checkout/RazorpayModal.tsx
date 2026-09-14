import React, { useState } from 'react';
import { ShieldCheck, Lock, Smartphone, CreditCard, Landmark, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface RazorpayModalProps {
  isOpen: boolean;
  orderId: string;
  keyId: string;
  amount: number; // in INR
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  orderId,
  keyId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState('customer@okhdfcbank');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        const paymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        onSuccess({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'simulated_valid_test_signature',
        });
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        {/* Header - Razorpay Navy Branding */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">Razorpay Trusted</span>
                <span className="text-[10px] uppercase font-bold bg-amber-400 text-neutral-900 px-1.5 py-0.2 rounded">
                  Test Gateway
                </span>
              </div>
              <p className="text-[11px] text-blue-200">Velnix Fashion Apparel • Verified Merchant</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-black text-white">{formatINR(amount)}</div>
            <div className="text-[10px] text-blue-200">{orderId}</div>
          </div>
        </div>

        {/* Modal Body */}
        {paymentSuccess ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Payment Authorized!</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Routing back to confirm your order and generate CJdropshipping AWB...
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-4">
            {/* Customer Details Pill */}
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600">
              <span className="font-medium text-neutral-800">{customerName}</span>
              <span>{customerPhone || '+91 98765 43210'}</span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  selectedMethod === 'card'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>NetBanking</span>
              </button>
            </div>

            {/* Tab Content */}
            {selectedMethod === 'upi' && (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">Instant UPI Payment</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Zero Fee</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setUpiVpa('pradumn@okhdfcbank')}
                    className="text-[10px] font-semibold text-neutral-600 bg-neutral-200 hover:bg-neutral-300 px-2 py-1 rounded"
                  >
                    Demo VPA
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500">
                  <span>Supported apps:</span>
                  <span className="font-semibold text-neutral-700">Google Pay • PhonePe • Paytm • CRED</span>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <span className="font-semibold text-neutral-800">Test Debit / Credit Card</span>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111 (Visa Sandbox)"
                  className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 text-xs"
                  />
                  <input
                    type="password"
                    readOnly
                    value="123"
                    className="px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 text-xs"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <span className="font-semibold text-neutral-800">Popular Indian Banks</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded border border-neutral-300 bg-white font-medium text-neutral-800">HDFC Bank</div>
                  <div className="p-2 rounded border border-neutral-300 bg-white font-medium text-neutral-800">State Bank of India</div>
                  <div className="p-2 rounded border border-neutral-300 bg-white font-medium text-neutral-800">ICICI Bank</div>
                  <div className="p-2 rounded border border-neutral-300 bg-white font-medium text-neutral-800">Axis Bank</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isAuthorizing}
                className="w-1/3 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isAuthorizing}
                className="w-2/3 py-2.5 bg-[#0c2340] hover:bg-[#123158] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Authorise {formatINR(amount)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Footer Trust Shield */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>PCI-DSS Level 1 Compliant • 256-bit SSL Security</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
