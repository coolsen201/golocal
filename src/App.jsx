import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProduct from './components/AddProduct';
import BuyerMap from './components/BuyerMap';
import SellerInventory from './pages/SellerInventory';
import AdminDashboard from './pages/AdminDashboard';
import { useState } from 'react';
import { ShoppingBag, Map, Package, BarChart3, LogOut } from 'lucide-react';
import './App.css';

function AppContent() {
  const [view, setView] = useState('buyer'); // 'seller', 'buyer', 'inventory', 'admin'
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-[2000] bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">GoLocal</h1>
            <span className="text-sm text-gray-600">
              {profile?.full_name} ({profile?.role})
            </span>
          </div>

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
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <ShoppingBag className="w-4 h-4 inline mr-1" />
                    Add Product
                  </button>
                  <button
                    onClick={() => setView('inventory')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition ${view === 'inventory'
                        ? 'bg-white text-blue-600 shadow'
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
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {view === 'seller' && profile?.role === 'seller' && <AddProduct />}
        {view === 'inventory' && profile?.role === 'seller' && <SellerInventory />}
        {view === 'admin' && profile?.role === 'admin' && <AdminDashboard />}
        {view === 'buyer' && <BuyerMap />}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
