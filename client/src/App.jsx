import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import Navbar from './components/Navbar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProfileSettings from './pages/ProfileSettings';
import MyOrders from './pages/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder Pages for now
import BuyerDashboard from './pages/BuyerDashboard';
import ProductDetails from './pages/ProductDetails';

// Helper component for Buyer Routing
const BuyerRoutes = () => (
  <Routes>
    <Route path="/" element={<BuyerDashboard />} />
    <Route path="product/:id" element={<ProductDetails />} />
  </Routes>
);

import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* General Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>

            {/* Role-Specific Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
              <Route path="/buyer/*" element={<BuyerRoutes />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route path="/seller/*" element={<SellerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
