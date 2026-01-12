import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerRegister from './pages/BuyerRegister';
import SellerRegister from './pages/SellerRegister';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SellerRegistration from './pages/SellerRegistration';
import SellerKycBusiness from './pages/SellerKycBusiness';
import SellerKycDocuments from './pages/SellerKycDocuments';
import './App.css';

// Component to handle smart redirection from legacy /dashboard route
function DashboardRedirect() {
  const { user, profile, loading } = useAuth();

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

  // Redirect based on role
  // Redirect based on role
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile?.role === 'seller') {
    // Check for incomplete KYC
    // Step 2 Missing: No Mobile Number
    if (!profile.mobile_number) return <Navigate to="/seller-onboarding/business" replace />;
    // Step 3 Missing: No Aadhaar URL (assuming it's mandatory)
    if (!profile.aadhaar_card_url) return <Navigate to="/seller-onboarding/documents" replace />;

    return <Navigate to="/seller" replace />;
  }
  return <Navigate to="/buyer" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/buyerregister" element={<BuyerRegister />} />
          <Route path="/sellerregister" element={<SellerRegister />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Legacy route, keeping just in case or redirecting */}
          <Route path="/seller-registration" element={<SellerRegistration />} />

          {/* New specific routes */}
          {/* New specific routes */}
          <Route path="/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Seller Onboarding Routes */}
          <Route path="/seller-onboarding/business" element={<ProtectedRoute><SellerKycBusiness /></ProtectedRoute>} />
          <Route path="/seller-onboarding/documents" element={<ProtectedRoute><SellerKycDocuments /></ProtectedRoute>} />

          {/* Smart Redirect for legacy route and login redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
