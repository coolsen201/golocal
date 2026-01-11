import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import AddProduct from '../components/AddProduct';
import SellerInventory from './SellerInventory';
import SellerRegistration from './SellerRegistration';
import { ShoppingBag, Package } from 'lucide-react';

const SellerDashboard = () => {
    const { profile } = useAuth();
    const [view, setView] = useState('inventory'); // Default to inventory

    // If seller is not approved, show registration/pending status
    if (profile?.approval_status !== 'approved') {
        return (
            <DashboardLayout>
                <SellerRegistration />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Internal Seller Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setView('inventory')}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${view === 'inventory'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            My Inventory
                        </button>
                        <button
                            onClick={() => setView('add')}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${view === 'add'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Add Product
                        </button>
                    </div>
                </div>

                <div className="animate-fadeIn">
                    {view === 'inventory' && <SellerInventory />}
                    {view === 'add' && <AddProduct />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SellerDashboard;
