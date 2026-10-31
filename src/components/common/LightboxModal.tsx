import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryItem } from '../../types/school';

interface LightboxModalProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  items,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const activeItem = isOpen ? items[currentIndex] : null;

  useEffect(() => {
    if (!isOpen || currentIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + items.length) % items.length);
      }
      if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % items.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !activeItem || currentIndex === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.title}
      className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono tabular-nums text-amber-400">
              {currentIndex + 1} / {items.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeItem.category}</span>
            <span aria-hidden="true">·</span>
            <span>{activeItem.date || activeItem.year}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="relative bg-slate-950 aspect-[16/10] w-full flex items-center justify-center overflow-hidden">
          <img
            src={activeItem.imageUrl}
            alt={activeItem.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
                aria-label="Previous Image"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((currentIndex + 1) % items.length)}
                aria-label="Next Image"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption details */}
        <div className="p-6 space-y-2 bg-slate-900">
          <h3 className="font-display text-xl font-bold text-white">{activeItem.title}</h3>
          {activeItem.subtitle && (
            <p className="text-xs font-medium text-amber-400">{activeItem.subtitle}</p>
          )}
          <p className="text-sm text-slate-300 leading-relaxed">{activeItem.description}</p>
        </div>
      </div>
    </div>
  );
};
