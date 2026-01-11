import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './components/AddProduct';
import BuyerMap from './components/BuyerMap';
import SellerInventory from './pages/SellerInventory';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SellerRegistration from './pages/SellerRegistration';
import { useState, useEffect } from 'react';
import { ShoppingBag, Map, Package, BarChart3, LogOut, LogIn } from 'lucide-react';
import './App.css';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [view, setView] = useState('buyer');

  useEffect(() => {
    if (profile?.role === 'seller') setView('seller');
    if (profile?.role === 'admin') setView('admin');
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-[2000] bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition" title={user?.email}>
            <img src="/Go-Local-1-10-2026.png" alt="GoLocal" style={{ height: '40px', width: 'auto' }} />
            {user && (
              <span className="text-sm text-gray-600 font-medium">
                {profile?.full_name || 'User'} ({profile?.role || 'buyer'})
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {/* Admin Dashboard */}
              {profile?.role === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === 'admin'
                    ? 'bg-white text-purple-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Admin
                </button>
              )}

              {/* Seller Views */}
              {profile?.role === 'seller' && (
                <>
                  <button
                    onClick={() => setView('seller')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === 'seller'
                      ? 'bg-white text-green-600 shadow'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-1" />
                    Add Product
                  </button>
                  <button
                    onClick={() => setView('inventory')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === 'inventory'
                      ? 'bg-white text-green-600 shadow'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <Package className="w-4 h-4 inline mr-1" />
                    Inventory
                  </button>
                </>
              )}

              {/* Buyer View (available to all) */}
              <button
                onClick={() => setView('buyer')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === 'buyer'
                  ? 'bg-white text-green-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Map className="w-4 h-4 inline mr-1" />
                Buyer
              </button>
              {/* Dashboard/Login Link */}
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen bg-gray-50">
        {user && profile?.role === 'seller' && profile?.approval_status !== 'approved' ? (
          <SellerRegistration />
        ) : (
          <div className="animate-fadeIn">
            {view === 'seller' && profile?.role === 'seller' && <AddProduct />}
            {view === 'inventory' && profile?.role === 'seller' && <SellerInventory />}
            {view === 'admin' && profile?.role === 'admin' && <AdminDashboard />}
            {view === 'buyer' && <BuyerMap />}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/seller-registration" element={<SellerRegistration />} />
          <Route path="/dashboard" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
