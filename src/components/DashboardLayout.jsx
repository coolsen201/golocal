import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, ShoppingBag, Package, Map, LogOut, LogIn } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, profile, signOut } = useAuth();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
    };

    const isActive = (path) => location.pathname === path;

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
                        {/* View Toggle / Navigation Links */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {/* Admin Dashboard */}
                            {profile?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center ${isActive('/admin')
                                        ? 'bg-white text-purple-600 shadow'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <BarChart3 className="w-4 h-4 mr-1" />
                                    Admin
                                </Link>
                            )}

                            {/* Seller Views */}
                            {profile?.role === 'seller' && (
                                <Link
                                    to="/seller"
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center ${isActive('/seller')
                                        ? 'bg-white text-green-600 shadow'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <ShoppingBag className="w-4 h-4 mr-1" />
                                    Seller Zone
                                </Link>
                            )}

                            {/* Buyer View (available to all) */}
                            <Link
                                to="/buyer"
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center ${isActive('/buyer')
                                    ? 'bg-white text-green-600 shadow'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <Map className="w-4 h-4 mr-1" />
                                Buyer
                            </Link>

                            {/* Sign Out / Login */}
                            {user ? (
                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 ml-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
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
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
