import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventCoupon from './pages/EventCoupon';
import FindEmail from './pages/FindEmail';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import CategoryList from './pages/CategoryList';
import ProductDetail from './pages/ProductDetail';
import ProductQnA from './pages/ProductQnA';
import ProductReviews from './pages/ProductReviews';
import SearchResults from './pages/SearchResults';
import BrandProducts from './pages/BrandProducts';
import AllBrands from './pages/AllBrands';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import SharedWishlist from './pages/SharedWishlist';
import Account from './pages/Account';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ScrollToTop';
import { GuestOnly, RequireAuth } from './components/RouteGuards';
import { clearAuthTokenCookie, clearRefreshTokenCookie } from './lib/api';

function App() {
  // 앱 시작 시 유효하지 않은 인증 데이터 정리
  useEffect(() => {
    try {
      const hasSession = typeof window !== 'undefined' && !!window.sessionStorage.getItem('auth');
      const hasAuthCookie = typeof document !== 'undefined' && /(?:^|; )ihy_access_token=/.test(document.cookie);
      
      // sessionStorage는 있는데 쿠키가 없는 경우 (만료된 세션)
      if (hasSession && !hasAuthCookie) {
        window.sessionStorage.removeItem('auth');
        window.dispatchEvent(new Event('auth:change'));
      }
      
      // 쿠키는 있는데 sessionStorage가 없는 경우 (비정상 상태)
      if (!hasSession && hasAuthCookie) {
        clearAuthTokenCookie();
        clearRefreshTokenCookie();
        window.dispatchEvent(new Event('auth:change'));
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <BrowserRouter>
        <ToastProvider>
          <CartProvider>
            <Header />
            <ScrollToTop />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/search/*" element={<SearchResults />} />
                <Route path="/brands" element={<AllBrands />} />
                <Route path="/brands/:brandId" element={<BrandProducts />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/c/:topId" element={<CategoryList />} />
                <Route path="/c/:topId/:midId" element={<CategoryList />} />
                <Route path="/c/:topId/:midId/:subId" element={<CategoryList />} />
                <Route path="/p/:id" element={<ProductDetail />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/products/:id/qna" element={<ProductQnA />} />
                <Route path="/products/:id/reviews" element={<ProductReviews />} />
                <Route path="/s/:shareId" element={<SharedWishlist />} />
                <Route element={<GuestOnly />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>
                <Route path="/find-email" element={<FindEmail />} />
                <Route path="/event/coupon" element={<EventCoupon />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route element={<RequireAuth />}>
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/account" element={<Account />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <div className="hidden sm:block">
              <Footer />
            </div>
          </CartProvider>
        </ToastProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;