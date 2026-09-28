import React from 'react';
import { Trash2 } from 'lucide-react';
import { CartItem } from '../../../types/rally';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQty,
  onRemoveItem
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
      <img
        src={item.product.image_url}
        alt={item.product.name_fa}
        className="w-16 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-900 truncate">
          {item.product.name_fa}
        </h4>
        <div className="text-[11px] text-gray-500 font-mono">
          {item.product.brand}
        </div>
        <div className="text-xs font-black text-gray-900 mt-1">
          {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
        </div>
      </div>

      {/* Qty & Remove Controls */}
      <div className="flex flex-col items-end gap-1.5">
        <button
          onClick={() => onRemoveItem(item.product.id)}
          className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
          title="حذف از سبد"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
          <button
            onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 font-bold"
          >
            -
          </button>
          <span className="px-2 text-xs font-bold text-gray-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
