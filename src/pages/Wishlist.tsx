import React from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist, type WishlistItem, apiFetchWishlist, apiDeleteWishlistItems } from '../lib/wishlist';

const Wishlist: React.FC = () => {
  const [items, setItems] = React.useState<WishlistItem[]>(() => getWishlist());
  const [loading, setLoading] = React.useState(false);
  const userId = React.useMemo(() => {
    // TODO: replace with real authenticated user id when auth is integrated
    return 1;
  }, []);

  React.useEffect(() => {
    // Try backend first; fallback to local on error
    (async () => {
      setLoading(true);
      try {
        const serverItems = await apiFetchWishlist(userId);
        if (serverItems && serverItems.length >= 0) {
          setItems(serverItems.map(si => ({ id: si.productId, name: si.productName, image: si.thumbnailUrl, addedAt: new Date(si.createdAt).getTime() })));
          setLoading(false);
          return;
        }
      } catch {}
      setItems(getWishlist());
      setLoading(false);
    })();
  }, [userId]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const handleRemove = (id: number) => {
    removeFromWishlist(id);
    setItems(getWishlist());
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allChecked = items.length > 0 && selected.size === items.length;
  const toggleAll = () => {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    // Attempt server deletion; fallback to local
    try {
      // Assuming itemIds are productIds here; if backend requires wishlist item ids, map accordingly
      await apiDeleteWishlistItems(userId, ids.map(Number));
      // refresh from server
      const serverItems = await apiFetchWishlist(userId);
      setItems(serverItems.map(si => ({ id: si.productId, name: si.productName, image: si.thumbnailUrl, addedAt: new Date(si.createdAt).getTime() })));
    } catch {
      ids.forEach(id => removeFromWishlist(id));
      setItems(getWishlist());
    }
    setSelected(new Set());
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-brand-gray-900">위시리스트</h1>
          <span className="text-sm text-brand-gray-600">{items.length} / 20</span>
        </div>
        <div className="flex items-center justify-start gap-3 mb-6">
          <label className="inline-flex items-center gap-2 text-sm text-brand-gray-700">
            <input type="checkbox" className="h-4 w-4" checked={allChecked} onChange={toggleAll} /> 전체 선택
          </label>
          <button
            onClick={removeSelected}
            disabled={selected.size===0}
            className={`px-3 py-1.5 rounded-md text-sm bg-white border border-solid ${selected.size===0 ? 'text-gray-400 border-gray-100 cursor-not-allowed' : 'text-brand-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
          >
            선택 삭제
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-brand-gray-700">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-gray-700 mb-4">위시리스트가 비어있습니다.</p>
            <Link to="/" className="inline-block px-4 py-2 rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80 text-sm">상품 보러 가기</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items
              .sort((a, b) => a.addedAt - b.addedAt) // 담은 순서대로
              .map(item => (
              <div key={item.id} className={`bg-white rounded-lg shadow-sm border ${selected.has(item.id) ? 'border-brand-pink' : 'border-gray-200'} overflow-hidden`}>
                <Link to={`/p/${item.id}`} className="block">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-brand-gray-900 line-clamp-2 flex-1">{item.name}</h3>
                    <label className="shrink-0 inline-flex items-center gap-1 text-sm text-brand-gray-700">
                      <input type="checkbox" className="h-4 w-4" checked={selected.has(item.id)} onChange={()=>toggleOne(item.id)} />
                    </label>
                  </div>
                  <div className="flex items-center justify-end">
                    <button onClick={()=>handleRemove(item.id)} aria-label="삭제" title="삭제" className="text-brand-gray-600 hover:text-red-500 border border-gray-300 hover:border-red-300 rounded-md p-1 bg-white">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1m-9 0h10" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link to="/" className="px-4 py-2 rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80 text-sm">상품 보러 가기</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

