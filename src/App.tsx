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
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <BrowserRouter>
        <ToastProvider>
          <CartProvider>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
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
