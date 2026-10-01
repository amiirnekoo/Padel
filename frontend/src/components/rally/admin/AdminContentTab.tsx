import React, { useState, useEffect } from 'react';
import { Newspaper, Image as ImageIcon, Plus, Edit, Trash2, CheckCircle2, XCircle, ExternalLink, RefreshCw, X } from 'lucide-react';
import { rallyApi } from '../../../services/rallyApi';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  cover_image: string;
  author_name: string;
  category_id: string;
  reading_time_minutes: number;
  is_published: boolean;
  view_count: number;
  created_at: string;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url: string;
  button_text?: string;
  banner_type: string;
  display_order: number;
  is_active: boolean;
}

export const AdminContentTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'articles' | 'banners'>('articles');
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '',
    summary: '',
    content_html: '',
    cover_image: '',
    category_id: 'news-training',
    reading_time_minutes: 5,
    is_published: true
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    button_text: 'مشاهده',
    banner_type: 'HERO_SLIDER',
    is_active: true
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (subTab === 'articles') {
        const res = await rallyApi.getAdminArticles();
        setArticles(Array.isArray(res) ? res : []);
      } else {
        const res = await rallyApi.getAdminBanners();
        setBanners(Array.isArray(res) ? res : []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subTab]);

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticle) {
      await rallyApi.updateAdminArticle(editingArticle.id, articleForm);
    } else {
      await rallyApi.createAdminArticle(articleForm);
    }
    setIsArticleModalOpen(false);
    setEditingArticle(null);
    fetchData();
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`حذف مقاله "${title}"؟`)) return;
    await rallyApi.deleteAdminArticle(id);
    fetchData();
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      await rallyApi.updateAdminBanner(editingBanner.id, bannerForm);
    } else {
      await rallyApi.createAdminBanner(bannerForm);
    }
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    fetchData();
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`حذف بنر "${title}"؟`)) return;
    await rallyApi.deleteAdminBanner(id);
    fetchData();
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-rally-primary" />
            <span>مدیریت محتوا و بنرهای تبلیغاتی (Content CMS)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            انتشار و ویرایش مقالات، وبلاگ آموزشی پدل و کنترل بنرهای اسلایدر سایت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (subTab === 'articles') {
                setEditingArticle(null);
                setArticleForm({ title: '', summary: '', content_html: '', cover_image: '', category_id: 'news-training', reading_time_minutes: 5, is_published: true });
                setIsArticleModalOpen(true);
              } else {
                setEditingBanner(null);
                setBannerForm({ title: '', subtitle: '', image_url: '', link_url: '', button_text: 'مشاهده', banner_type: 'HERO_SLIDER', is_active: true });
                setIsBannerModalOpen(true);
              }
            }}
            className="px-4 py-2 bg-rally-primary hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{subTab === 'articles' ? 'افزودن مقاله جدید' : 'افزودن بنر جدید'}</span>
          </button>
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rally-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('articles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'articles' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          مقالات و پایگاه دانش ({articles.length})
        </button>
        <button
          onClick={() => setSubTab('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subTab === 'banners' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          بنرهای صفحه نخست ({banners.length})
        </button>
      </div>

      {/* Content Area */}
      {subTab === 'articles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-video bg-slate-950 overflow-hidden relative">
                  <img src={art.cover_image} alt={art.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${art.is_published ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
                    {art.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-white line-clamp-1">{art.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{art.summary}</p>
                </div>
              </div>
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">{art.reading_time_minutes} دقیقه مطالعه</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingArticle(art);
                      setArticleForm({
                        title: art.title,
                        summary: art.summary,
                        content_html: art.content_html,
                        cover_image: art.cover_image,
                        category_id: art.category_id,
                        reading_time_minutes: art.reading_time_minutes,
                        is_published: art.is_published
                      });
                      setIsArticleModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteArticle(art.id, art.title)} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="aspect-[21/9] bg-slate-950 overflow-hidden relative">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800">
                  {b.banner_type}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{b.title}</h4>
                  <p className="text-xs text-slate-400">{b.subtitle || b.link_url}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingBanner(b);
                      setBannerForm({
                        title: b.title,
                        subtitle: b.subtitle || '',
                        image_url: b.image_url,
                        link_url: b.link_url,
                        button_text: b.button_text || 'مشاهده',
                        banner_type: b.banner_type,
                        is_active: b.is_active
                      });
                      setIsBannerModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteBanner(b.id, b.title)} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button onClick={() => setIsArticleModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white">{editingArticle ? 'ویرایش مقاله' : 'ثبت مقاله جدید'}</h3>
            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">عنوان مقاله</label>
                <input type="text" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">خلاصه کوتاه</label>
                <input type="text" value={articleForm.summary} onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">لینک تصویر کاور</label>
                <input type="text" value={articleForm.cover_image} onChange={(e) => setArticleForm({ ...articleForm, cover_image: e.target.value })} required placeholder="/uploads/articles/... یا /images/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">متن اصلی مقاله (HTML)</label>
                <textarea value={articleForm.content_html} onChange={(e) => setArticleForm({ ...articleForm, content_html: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white h-32" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" checked={articleForm.is_published} onChange={(e) => setArticleForm({ ...articleForm, is_published: e.target.checked })} />
                  <span>انتشار عمومی در وبلاگ</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsArticleModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" className="px-5 py-2 bg-rally-primary text-white rounded-xl font-bold">ذخیره مقاله</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button onClick={() => setIsBannerModalOpen(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white">{editingBanner ? 'ویرایش بنر' : 'ثبت بنر جدید'}</h3>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">عنوان بنر</label>
                <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">لینک تصویر بنر</label>
                <input type="text" value={bannerForm.image_url} onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })} required placeholder="/uploads/banners/... یا /images/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">لینک مقصد کلیک</label>
                <input type="text" value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} required placeholder="/shop یا /tournaments یا /court/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 font-bold">انصراف</button>
                <button type="submit" className="px-5 py-2 bg-rally-primary text-white rounded-xl font-bold">ذخیره بنر</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
