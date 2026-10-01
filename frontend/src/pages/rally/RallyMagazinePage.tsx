import React, { useState } from 'react';
import { Newspaper, BookOpen, Calendar, Clock, User, Tag, ChevronLeft, X, Sparkles } from 'lucide-react';
import { MOCK_ARTICLES, ArticleItem } from '../../data/mockNewsData';

export const RallyMagazinePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  const categories = [
    { id: 'ALL', label: 'همه مطالب' },
    { id: 'NATIONAL_TEAM', label: 'اخبار تیم ملی' },
    { id: 'WORLD_PADEL', label: 'پدل جهان (Premier Padel)' },
    { id: 'TUTORIAL', label: 'آموزش و تکنیک' },
    { id: 'EVENTS', label: 'رویدادها و مسترکلاس‌ها' }
  ];

  const filteredArticles = selectedCategory === 'ALL'
    ? MOCK_ARTICLES
    : MOCK_ARTICLES.filter((a) => a.category === selectedCategory);

  const featuredArticle = MOCK_ARTICLES.find((a) => a.featured) || MOCK_ARTICLES[0];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-rally-primary" />
          <h1 className="text-xl sm:text-2xl font-black text-rally-charcoal">
            مجله تخصصی و پایگاه خبری پدل ایران و جهان
          </h1>
        </div>
        <p className="text-xs text-gray-500">
          جدیدترین اخبار تیم‌های ملی، رویدادهای تور جهانی، مقالات فنی و تکنیک‌های ارتقای سطح بازی
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rally-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article Hero (When viewing ALL) */}
      {selectedCategory === 'ALL' && featuredArticle && (
        <div
          onClick={() => setActiveArticle(featuredArticle)}
          className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
        >
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-900">
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rally-accent text-rally-charcoal flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>گزارش ویژه</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="text-rally-primary font-bold">{featuredArticle.categoryLabel}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredArticle.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTime}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-rally-charcoal leading-snug group-hover:text-rally-primary transition-colors">
                {featuredArticle.title}
              </h2>

              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                {featuredArticle.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {featuredArticle.author}
              </span>
              <span className="text-xs font-black text-rally-primary flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                <span>مطالعه کامل مقاله</span>
                <ChevronLeft className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setActiveArticle(article)}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0E3D38] text-white">
                  {article.categoryLabel}
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-sm font-black text-rally-charcoal leading-snug group-hover:text-rally-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 truncate max-w-[150px]">{article.author}</span>
              <span className="text-xs font-bold text-rally-primary flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
                <span>ادامه</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/9] w-full bg-gray-900">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 text-white">
                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-rally-accent text-rally-charcoal mb-2">
                  {activeArticle.categoryLabel}
                </span>
                <h2 className="text-base sm:text-xl font-black leading-snug">{activeArticle.title}</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pb-3 border-b border-gray-100">
                <span className="flex items-center gap-1 font-bold text-rally-charcoal">
                  <User className="w-3.5 h-3.5 text-rally-primary" />
                  نویسنده: {activeArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  انتشار: {activeArticle.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  زمان مطالعه: {activeArticle.readTime}
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-gray-700">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-1.5 items-center">
                <Tag className="w-3.5 h-3.5 text-gray-400 ml-1" />
                {activeArticle.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
