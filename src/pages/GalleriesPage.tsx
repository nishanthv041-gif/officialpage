import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ZoomIn } from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import { filterGalleryItems } from '../utils/schoolLogic';
import { TiltCard, ResilientImage } from '../components/common/TiltCard';
import { LightboxModal } from '../components/common/LightboxModal';

type ActiveGalleryTab = 'events' | 'sports' | 'achievements';

export const GalleriesPage: React.FC<{ initialTab?: ActiveGalleryTab }> = ({ initialTab }) => {
  const { galleryItems } = useSchoolData();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as ActiveGalleryTab | null;
  const [activeTab, setActiveTab] = useState<ActiveGalleryTab>(
    initialTab ||
      (tabParam && ['events', 'sports', 'achievements'].includes(tabParam) ? tabParam : 'events')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setSelectedCategory('All');
      setSelectedYear('All');
    } else if (tabParam && ['events', 'sports', 'achievements'].includes(tabParam)) {
      setActiveTab(tabParam);
      setSelectedCategory('All');
      setSelectedYear('All');
    }
  }, [initialTab, tabParam]);

  const handleSwitchTab = (tab: ActiveGalleryTab) => {
    setActiveTab(tab);
    setSelectedCategory('All');
    setSelectedYear('All');
    setSearchParams({ tab });
  };

  const sectionItems = useMemo(
    () => galleryItems.filter((item) => item.section === activeTab),
    [galleryItems, activeTab]
  );

  const availableCategories = useMemo(() => {
    const set = new Set<string>(['All']);
    if (activeTab === 'sports') {
      ['Athletics', 'Kabaddi', 'Football', 'Cricket'].forEach((c) => set.add(c));
    }
    sectionItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [sectionItems, activeTab]);

  const availableYears = useMemo(() => {
    const set = new Set<string>(['All', '2026', '2025']);
    sectionItems.forEach((i) => {
      if (i.year) set.add(i.year);
    });
    return Array.from(set);
  }, [sectionItems]);

  const filteredItems = useMemo(
    () =>
      filterGalleryItems(galleryItems, {
        section: activeTab,
        category: selectedCategory,
        year: selectedYear,
        searchQuery,
      }),
    [galleryItems, activeTab, selectedCategory, selectedYear, searchQuery]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-10">
      {/* Header & Section Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Campus Visual Archives</span>
            <span aria-hidden="true">·</span>
            <span>Events, Sports &amp; Board Achievements</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'events' && 'School Events & Cultural Celebrations'}
            {activeTab === 'sports' && 'Sports Championships, Teams & Athletics'}
            {activeTab === 'achievements' && 'Academic Toppers, NEET Ranks & School Honours'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Click any card to open the full-resolution lightbox slider with captions and historical
            records.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div
          role="tablist"
          aria-label="Gallery Section Switcher"
          className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start"
        >
          {(
            [
              ['events', 'Events Gallery'],
              ['sports', 'Sports & Teams'],
              ['achievements', 'Achievements Masonry'],
            ] as [ActiveGalleryTab, string][]
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={activeTab === tabKey}
              onClick={() => handleSwitchTab(tabKey)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tabKey
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar: Category Segmented Buttons + Year Filter + Search */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Category:</span>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Year Filter & Search Input */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Year:</span>
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded text-xs font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or keyword..."
              aria-label="Search gallery items"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Gallery Grid / Masonry Collection */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            No matching records in this filter
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try resetting the category or year filter to view all archived photographs.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedYear('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            activeTab === 'achievements'
              ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          }
        >
          {filteredItems.map((item, idx) => (
            <TiltCard
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className={`break-inside-avoid rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                <div
                  className={`relative overflow-hidden bg-slate-950 ${
                    activeTab === 'achievements' && idx % 2 === 0
                      ? 'aspect-[16/11]'
                      : 'aspect-[4/3]'
                  }`}
                >
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-slate-950/80 text-white opacity-90 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-6 space-y-2.5">
                  {/* Unboxed Metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.year}</span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h2>

                  {item.subtitle && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Click to open Lightbox Slider</span>
                <span className="font-mono tabular-nums">#{idx + 1}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      <LightboxModal
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
};
