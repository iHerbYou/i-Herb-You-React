import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventCoupon from './pages/EventCoupon';
import FindEmail from './pages/FindEmail';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import CategoryList from './pages/CategoryList';
import ProductDetail from './pages/ProductDetail';
import ProductQnA from './pages/ProductQnA';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ScrollToTop';
import { GuestOnly, RequireAuth } from './components/RouteGuards';

function App() {
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
                <Route path="/c/:topId" element={<CategoryList />} />
                <Route path="/c/:topId/:midId" element={<CategoryList />} />
                <Route path="/c/:topId/:midId/:subId" element={<CategoryList />} />
                <Route path="/p/:id" element={<ProductDetail />} />
                <Route path="/p/:id/qna" element={<ProductQnA />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
                <Route element={<GuestOnly />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>
                <Route path="/find-email" element={<FindEmail />} />
                <Route path="/event/coupon" element={<EventCoupon />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<RequireAuth />}>
                  {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
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
