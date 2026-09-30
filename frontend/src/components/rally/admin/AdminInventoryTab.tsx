import React, { useState, useMemo } from 'react';
import { Search, Plus, PackageCheck, AlertCircle, Edit2, Check, RefreshCw } from 'lucide-react';
import { ShopProduct } from '../../../types/rally';

interface AdminInventoryTabProps {
  products: ShopProduct[];
  onUpdateProduct: (productId: string, updates: Partial<ShopProduct>) => void;
  onOpenNewProductModal: () => void;
}

export const AdminInventoryTab: React.FC<AdminInventoryTabProps> = ({
  products,
  onUpdateProduct,
  onOpenNewProductModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const BRANDS = ['ALL', 'Nox', 'Bullpadel', 'Head', 'Babolat', 'Wilson'];

  const filteredList = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== 'ALL' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return p.name_fa.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q) || p.id.includes(q);
      }
      return true;
    });
  }, [products, selectedBrand, searchQuery]);

  const handleStockChange = (p: ShopProduct, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    onUpdateProduct(p.id, { stock: newStock });
  };

  const handleStartEdit = (p: ShopProduct) => {
    setEditingId(p.id);
    setEditPrice(p.price);
  };

  const handleSavePrice = (productId: string) => {
    onUpdateProduct(productId, { price: editPrice });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در انبار (نام کالا، برند یا شناسه)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b === 'ALL' ? 'همه برندها' : b}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenNewProductModal}
          className="px-4 py-2 bg-rally-primary hover:bg-rally-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن کالای جدید</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300 table-fixed min-w-[700px]">
            <colgroup>
              <col className="w-12" />
              <col className="w-1/3" />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 text-center">تصویر</th>
                <th className="py-3 px-3">نام و مشخصات محصول</th>
                <th className="py-3 px-3">برند / سال</th>
                <th className="py-3 px-3">قیمت واحد (تومان)</th>
                <th className="py-3 px-3 text-center">موجودی انبار</th>
                <th className="py-3 px-3 text-center">وضعیت عرضه</th>
                <th className="py-3 px-3 text-center">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center mx-auto">
                        <img
                          src={p.image_url}
                          alt={p.name_fa}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white text-xs line-clamp-1">{p.name_fa}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{p.id}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-200">{p.brand}</span>
                      <span className="block text-[10px] text-amber-500/80 font-mono">{p.year || 2026}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step={100000}
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-24 bg-slate-950 border border-rally-primary rounded px-1.5 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSavePrice(p.id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white">{p.price.toLocaleString('fa-IR')}</span>
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                        <button
                          onClick={() => handleStockChange(p, -1)}
                          className="px-2 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-mono text-xs font-bold text-white min-w-[28px] text-center">
                          {p.stock}
                        </span>
                        <button
                          onClick={() => handleStockChange(p, 1)}
                          className="px-2 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {p.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          موجود
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          ناموجود
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleStockChange(p, p.stock > 0 ? -p.stock : 5)}
                        className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        {p.stock > 0 ? 'اتمام موجودی' : 'شارژ ۵ عدد'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
