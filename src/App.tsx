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
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import ScrollToTop from './components/ScrollToTop';

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
                <Route path="/c/:top" element={<CategoryList />} />
                <Route path="/c/:top/:mid" element={<CategoryList />} />
                <Route path="/c/:top/:mid/:sub" element={<CategoryList />} />
                <Route path="/p/:id" element={<ProductDetail />} />
                <Route path="/p/:id/qna" element={<ProductQnA />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/find-email" element={<FindEmail />} />
                <Route path="/event/coupon" element={<EventCoupon />} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
