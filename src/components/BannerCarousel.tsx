import React, { useEffect, useMemo, useRef, useState } from 'react';
import { get } from '../lib/api';

// Fallback mock banners (keep like categories)
const fallbackBanners: { imageUrl: string; sortOrder: number }[] = [
  { imageUrl: 'https://file.cafe24cos.com/banner-admin-live/upload/sojjung3/2fe7eb01-25ff-4f47-efed-140d2e63a52d.jpeg', sortOrder: 1 },
  { imageUrl: 'https://file.cafe24cos.com/banner-admin-live/upload/sojjung3/8043aa11-4393-41a4-d987-57371ee9eeda.jpeg', sortOrder: 2 },
  { imageUrl: 'https://file.cafe24cos.com/banner-admin-live/upload/sojjung3/84cc8078-8d11-4b41-b882-ca867ae495c7.jpeg', sortOrder: 3 },
];

const AUTO_INTERVAL_MS = 4000;

const BannerCarousel: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [images, setImages] = useState<string[]>(() => fallbackBanners.sort((a,b)=> (a.sortOrder||0)-(b.sortOrder||0)).map(b => b.imageUrl));
  const timerRef = useRef<number | null>(null);
  const slides = useMemo(() => images, [images]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await get<Array<{ id: number; bannerName: string; imageUrl: string; sortOrder: number }>>('/api/banner', { auth: false });
        if (!mounted) return;
        if (Array.isArray(res) && res.length) {
          const sorted = [...res].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setImages(sorted.map(b => b.imageUrl));
        }
      } catch {
        // ignore, fallback already set
      }
    })();
    return () => { mounted = false; };
  }, []);

  const goTo = (i: number) => {
    setIndex((i + slides.length) % slides.length);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((prevIdx) => (prevIdx + 1) % slides.length);
    }, AUTO_INTERVAL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  return (
    <section className="w-full bg-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl">
          <div
            className="whitespace-nowrap transition-transform duration-500"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((src, i) => (
              <div key={i} className="inline-block w-full align-top">
                <div className="relative w-full pt-[36%] bg-gray-100">
                  <img
                    src={src}
                    alt={`banner-${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-brand-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-brand-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center space-x-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === index ? 'bg-brand-pink w-6' : 'bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerCarousel;

