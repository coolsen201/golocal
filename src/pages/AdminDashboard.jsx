import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../supabaseClient';
import { BarChart3, Users, Package, TrendingUp, CheckCircle, XCircle, FileText, ExternalLink, Calculator, AlertCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'approvals'
    const [inventory, setInventory] = useState([]);
    const [sellerRequests, setSellerRequests] = useState([]); // Stores ALL seller profiles
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

            // Fetch ALL seller profiles (not just pending)
            const { data: allSellersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'seller')
                .order('created_at', { ascending: false }); // Newest first

            setInventory(inventoryData || []);
            setSellerRequests(allSellersData || []);

            const totalStock = inventoryData?.reduce((sum, item) => sum + (item.quantity_in_stock || 0), 0) || 0;
            const inventoryValue = inventoryData?.reduce((sum, item) => sum + ((item.quantity_in_stock || 0) * (item.cost_per_unit || 0)), 0) || 0;

            setStats({
                totalSellers: allSellersData?.length || 0,
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

            // Optimistic update
            setSellerRequests(prev => prev.map(seller =>
                seller.id === userId ? { ...seller, approval_status: status } : seller
            ));

        } catch (error) {
            alert('Error updating status: ' + error.message);
            fetchData(); // Revert on error
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = sellerRequests.filter(s => s.approval_status === 'pending').length;

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
                            Seller Requests
                            {pendingCount > 0 && (
                                <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
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
                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
                        {sellerRequests.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-xl shadow-md">
                                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">No Sellers Found</h3>
                                <p className="text-gray-500">There are no registered sellers yet.</p>
                            </div>
                        ) : (
                            sellerRequests.map((seller) => (
                                <div key={seller.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 p-2 rounded-lg">
                                                <Users className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{seller.full_name}</h3>
                                                <span className="text-xs text-gray-500 uppercase tracking-widest">{seller.business_type}</span>
                                            </div>
                                            {/* Status Badge */}
                                            <div className={`
                                                flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${seller.approval_status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                                                ${seller.approval_status === 'pending' || seller.approval_status === 'none' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                ${seller.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                            `}>
                                                {seller.approval_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                {seller.approval_status === 'pending' && <Clock className="w-3 h-3" />}
                                                {seller.approval_status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {seller.approval_status || 'Pending'}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Actions based on current status */}
                                            {seller.approval_status !== 'approved' && (
                                                <button
                                                    onClick={() => handleApproval(seller.id, 'approved')}
                                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition transform active:scale-95"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                            )}

                                            {seller.approval_status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleApproval(seller.id, 'rejected')}
                                                    className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition"
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> Contact & Address
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">Mobile:</span> <span className="font-medium">{seller.mobile_number}</span></p>
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">Address:</span> <span className="font-medium text-right w-2/3 truncate">{seller.business_address}</span></p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <Calculator className="w-3 h-3" /> Tax Details
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">PAN:</span> <span className="font-medium">{seller.pan_number}</span></p>
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">GSTIN:</span> <span className="font-medium">{seller.gstin}</span></p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Bank Details
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">Bank:</span> <span className="font-medium">{seller.bank_name}</span></p>
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">Acc No:</span> <span className="font-medium">{seller.account_number}</span></p>
                                                <p className="flex justify-between border-b pb-1 border-gray-100"><span className="text-gray-500">IFSC:</span> <span className="font-medium">{seller.ifsc_code}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents Section */}
                                    <div className="px-6 pb-6 pt-0 border-t border-gray-100 mt-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mt-4 mb-3 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> Verification Documents
                                        </h4>
                                        <div className="flex gap-6">
                                            {[
                                                { label: 'Aadhaar', url: seller.aadhaar_card_url },
                                                { label: 'Selfie', url: seller.selfie_url },
                                                { label: 'Shop Photo', url: seller.shop_photo_url || seller.image_url } // Fallback to shop image
                                            ].map((doc, idx) => (
                                                doc.url ? (
                                                    <div key={idx} className="group relative">
                                                        <div
                                                            className="h-16 w-16 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition shadow-sm"
                                                            onClick={() => window.open(doc.url, '_blank')}
                                                            title={`View ${doc.label}`}
                                                        >
                                                            <img src={doc.url} alt={doc.label} className="h-full w-full object-cover group-hover:scale-110 transition duration-300" />
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-medium px-1 mt-1 block text-center">{doc.label}</span>
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 pointer-events-none transition rounded-lg" />
                                                        <ExternalLink className="absolute top-1 right-1 w-3 h-3 text-white opacity-0 group-hover:opacity-100 drop-shadow-md pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <div key={idx} className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50">
                                                        <span className="text-[8px] text-gray-400 uppercase font-bold">{doc.label}</span>
                                                        <span className="text-[10px] text-gray-300">N/A</span>
                                                    </div>
                                                )
                                            ))}
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
