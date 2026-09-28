import React, { useState } from 'react';
import { X, ShoppingBag, ArrowRight, Tag, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { CartItem, ShopOrderReceipt } from '../../../types/rally';
import { CartItemRow } from './CartItemRow';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  walletBalance: number;
  onOrderComplete: (receipt: ShopOrderReceipt) => void;
  userName?: string;
  userPhone?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  walletBalance,
  onOrderComplete,
  userName = 'امیر نکوزاده',
  userPhone = '۰۹۱۲۳۴۵۶۷۸۹'
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'SHAPARAK'>('WALLET');
  const [address, setAddress] = useState('تهران، شهرک غرب، بلوار فرحزادی، پلاک ۱۲');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 2000000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 120000;

  let discountRate = 0;
  if (appliedCoupon === 'RALLY10') discountRate = 0.10;
  if (appliedCoupon === 'FIRSTORDER') discountRate = 0.15;
  const discountAmount = Math.floor(subtotal * discountRate);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'RALLY10' || code === 'FIRSTORDER') {
      setAppliedCoupon(code);
    } else {
      setCouponError('کد تخفیف معتبر نیست. (کد تست: RALLY10)');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (paymentMethod === 'WALLET' && walletBalance < totalAmount) {
      alert('موجودی کیف پول شما کافی نیست. لطفاً کیف پول را شارژ نمایید یا درگاه بانکی را انتخاب کنید.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const trackingCode = `RLY-SHP-${Math.floor(100000 + Math.random() * 900000)}`;
      const receipt: ShopOrderReceipt = {
        orderId: `ord-${Date.now()}`,
        trackingCode,
        items: items.map((i) => ({
          productId: i.product.id,
          nameFa: i.product.name_fa,
          quantity: i.quantity,
          unitPrice: i.product.price,
          totalPrice: i.product.price * i.quantity
        })),
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        receiverName: userName,
        receiverPhone: userPhone,
        deliveryAddress: address,
        paymentMethod,
        createdAt: new Date().toLocaleDateString('fa-IR')
      };
      onClearCart();
      onClose();
      onOrderComplete(receipt);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left-full sm:slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rally-primary" />
            <h3 className="font-black text-gray-900 text-sm">سبد خرید تجهیزات</h3>
            <span className="bg-rally-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          {isFreeShipping ? (
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ارسال اکسپرس این سفارش کاملاً رایگان است!
            </span>
          ) : (
            <span className="font-medium">
              تنها {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('fa-IR')} تومان تا ارسال رایگان
            </span>
          )}
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 opacity-40" />
              <p className="font-bold text-sm text-gray-600">سبد خرید شما خالی است</p>
              <p className="text-xs text-gray-400 mt-1">
                راکت‌ها، توپ‌ها و متعلقات مورد نیاز خود را به سبد اضافه کنید.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onRemoveItem={onRemoveItem}
              />
            ))
          )}
        </div>

        {/* Footer Checkout Controls */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="کد تخفیف (مثال: RALLY10)"
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-rally-primary"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                اعمال
              </button>
            </form>
            {appliedCoupon && (
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>کد {appliedCoupon} اعمال شد.</span>
              </div>
            )}
            {couponError && <p className="text-[11px] text-red-500 font-medium">{couponError}</p>}

            {/* Address */}
            <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-800 block mb-0.5">آدرس تحویل:</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white px-2 py-1 text-xs border border-gray-200 rounded-lg"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'WALLET'
                    ? 'border-rally-primary bg-slate-900 text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>کیف پول رالی</span>
                </div>
                <span className="text-[10px] opacity-80">
                  موجودی: {(walletBalance / 10).toLocaleString('fa-IR')} ت
                </span>
              </button>

              <button
                onClick={() => setPaymentMethod('SHAPARAK')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'SHAPARAK'
                    ? 'border-rally-primary bg-slate-900 text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>درگاه بانکی شتاب</span>
                </div>
                <span className="text-[10px] opacity-80">تمامی کارت‌های بانکی</span>
              </button>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>جمع اقلام:</span>
                <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-500 font-bold">
                  <span>تخفیف:</span>
                  <span>- {discountAmount.toLocaleString('fa-IR')} تومان</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>هزینه ارسال:</span>
                <span>{shippingFee === 0 ? 'رایگان' : `${shippingFee.toLocaleString('fa-IR')} تومان`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-200">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-emerald-700 font-black">{totalAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>در حال ثبت سفارش...</span>
              ) : (
                <>
                  <span>تأیید نهایی و پرداخت</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
