import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGetSharedWishlist, type SharedWishlistResponse } from '../lib/wishlist';

const SharedWishlist: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = React.useState<SharedWishlistResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!shareId) {
      setError('잘못된 접근입니다.');
      return;
    }
    apiGetSharedWishlist(shareId)
      .then(setData)
      .catch((err) => {
        console.error('Failed to load shared wishlist:', err);
        setError('위시리스트를 불러올 수 없습니다.');
      });
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-gray-700 mb-4">{error}</p>
          <Link to="/" className="text-brand-pink hover:text-brand-pink/80">홈으로 가기</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <div className="text-brand-gray-700">로딩 중...</div>
      </div>
    );
  }

  const { wishlist, createdAt, expiresAt } = data;
  const items = wishlist.items;
  const count = wishlist.count;

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">공유된 위시리스트</h1>
          <div className="text-sm text-brand-gray-600">
            <p>공유 시점: {new Date(createdAt).toLocaleString('ko-KR')}</p>
            <p>만료 시점: {new Date(expiresAt).toLocaleString('ko-KR')}</p>
          </div>
        </div>

        {count === 0 ? (
          <div className="text-center py-12 text-brand-gray-600">
            위시리스트가 비어있습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.itemId}
                to={`/p/${item.productId}`}
                className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-brand-gray-900 font-medium mb-1 line-clamp-2">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-brand-gray-600">
                    담은 시점: {new Date(item.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWishlist;