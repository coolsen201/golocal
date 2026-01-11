import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../supabaseClient';
import { BarChart3, Users, Package, TrendingUp, CheckCircle, XCircle, FileText, ExternalLink, Calculator } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'approvals'
    const [inventory, setInventory] = useState([]);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [stats, setStats] = useState({
        totalSellers: 0,
        totalProducts: 0,
        totalStock: 0,
        inventoryValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch full inventory
            const { data: inventoryData } = await supabase
                .from('inventory_items')
                .select(`*, shops (*, profiles (*))`)
                .order('created_at', { ascending: false });

            // Fetch pending approvals
            const { data: pendingData } = await supabase
                .from('profiles')
                .select('*')
                .eq('approval_status', 'pending');

            // Fetch all sellers for stats
            const { data: sellerData } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'seller');

            setInventory(inventoryData || []);
            setPendingSellers(pendingData || []);

            const totalStock = inventoryData?.reduce((sum, item) => sum + (item.quantity_in_stock || 0), 0) || 0;
            const inventoryValue = inventoryData?.reduce((sum, item) => sum + ((item.quantity_in_stock || 0) * (item.cost_per_unit || 0)), 0) || 0;

            setStats({
                totalSellers: sellerData?.length || 0,
                totalProducts: inventoryData?.length || 0,
                totalStock,
                inventoryValue: inventoryValue.toFixed(2),
            });
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId, status) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ approval_status: status })
                .eq('id', userId);

            if (error) throw error;
            fetchData();
        } catch (error) {
            alert('Error updating status: ' + error.message);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                        Admin Dashboard
                    </h1>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'}`}
                        >
                            Approvals
                            {pendingSellers.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {pendingSellers.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <Users className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Total Sellers</p>
                        <p className="text-3xl font-bold">{stats.totalSellers}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <Package className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Total Products</p>
                        <p className="text-3xl font-bold">{stats.totalProducts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Total Stock</p>
                        <p className="text-3xl font-bold">{stats.totalStock}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <BarChart3 className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Inventory Value</p>
                        <p className="text-3xl font-bold">₹{stats.inventoryValue}</p>
                    </div>
                </div>

                {activeTab === 'inventory' ? (
                    <>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Seller / Shop</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredInventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{item.shops?.profiles?.full_name}</div>
                                                <div className="text-xs text-gray-500">{item.shops?.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{item.quantity_in_stock}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-700">₹{item.cost_per_unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        {pendingSellers.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-xl shadow-md">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No Pending Approvals</h3>
                                <p className="text-gray-500">All seller registrations have been processed.</p>
                            </div>
                        ) : (
                            pendingSellers.map((seller) => (
                                <div key={seller.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 p-2 rounded-lg">
                                                <Users className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{seller.full_name}</h3>
                                                <span className="text-xs text-gray-500 uppercase tracking-widest">{seller.business_type}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproval(seller.id, 'approved')}
                                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproval(seller.id, 'rejected')}
                                                className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> Contact & Address
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-500">Mobile:</span> {seller.mobile_number}</p>
                                                <p className="text-gray-600">{seller.business_address}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <Calculator className="w-3 h-3" /> Tax Details
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-500">PAN:</span> {seller.pan_number}</p>
                                                <p><span className="text-gray-500">GSTIN:</span> {seller.gstin}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Bank Details
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-500">Bank:</span> {seller.bank_name}</p>
                                                <p><span className="text-gray-500">Acc No:</span> {seller.account_number}</p>
                                                <p><span className="text-gray-500">IFSC:</span> {seller.ifsc_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
