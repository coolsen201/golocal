import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart3, Users, Package, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    const [inventory, setInventory] = useState([]);
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
        try {
            // Fetch full inventory with seller details
            const { data: inventoryData, error: invError } = await supabase
                .from('inventory_items')
                .select(`
                    *,
                    shops (
                        name,
                        owner_id,
                        profiles (
                            full_name,
                            phone
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (invError) throw invError;

            // Fetch stats
            const { data: sellerStats } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('role', 'seller');

            setInventory(inventoryData || []);

            // Calculate stats
            const totalStock = inventoryData?.reduce((sum, item) => sum + (item.quantity_in_stock || 0), 0) || 0;
            const inventoryValue = inventoryData?.reduce((sum, item) =>
                sum + ((item.quantity_in_stock || 0) * (item.cost_per_unit || 0)), 0
            ) || 0;

            setStats({
                totalSellers: sellerStats?.length || 0,
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

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shops?.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                Admin Dashboard
            </h1>

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

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by product, shop, or seller name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.shops?.profiles?.full_name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.shops?.profiles?.phone || ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.shops?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.barcode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.quantity_in_stock > 10
                                                ? 'bg-green-100 text-green-800'
                                                : item.quantity_in_stock > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {item.quantity_in_stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.quantity_sold || 0}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{item.cost_per_unit}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-700">
                                        ₹{(item.quantity_in_stock * item.cost_per_unit).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
