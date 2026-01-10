import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Package, Edit2, Save, X, Trash2 } from 'lucide-react';

const SellerInventory = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const { data: shopData } = await supabase
                .from('shops')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (shopData) {
                const { data, error } = await supabase
                    .from('inventory_items')
                    .select('*')
                    .eq('shop_id', shopData.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditForm({
            quantity_in_stock: product.quantity_in_stock,
            cost_per_unit: product.cost_per_unit,
            bulk_moq_cost: product.bulk_moq_cost,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (productId) => {
        try {
            const { error } = await supabase
                .from('inventory_items')
                .update({
                    quantity_in_stock: parseInt(editForm.quantity_in_stock),
                    cost_per_unit: parseFloat(editForm.cost_per_unit),
                    bulk_moq_cost: editForm.bulk_moq_cost ? parseFloat(editForm.bulk_moq_cost) : null,
                })
                .eq('id', productId);

            if (error) throw error;

            await fetchProducts();
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const deleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('inventory_items')
                .delete()
                .eq('id', productId);

            if (error) throw error;
            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-8 h-8 text-blue-600" />
                    My Inventory
                </h1>
                <p className="text-gray-600 mt-2">
                    Total Items: <span className="font-bold">{products.length}</span>
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulk Price (₹)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.barcode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4">
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                className="w-20 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={editForm.quantity_in_stock}
                                                onChange={(e) => setEditForm({ ...editForm, quantity_in_stock: e.target.value })}
                                            />
                                        ) : (
                                            <span className="text-sm font-medium">{product.quantity_in_stock}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-24 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={editForm.cost_per_unit}
                                                onChange={(e) => setEditForm({ ...editForm, cost_per_unit: e.target.value })}
                                            />
                                        ) : (
                                            <span className="text-sm font-medium">₹{product.cost_per_unit}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-24 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={editForm.bulk_moq_cost || ''}
                                                onChange={(e) => setEditForm({ ...editForm, bulk_moq_cost: e.target.value })}
                                            />
                                        ) : (
                                            <span className="text-sm font-medium">
                                                {product.bulk_moq_cost ? `₹${product.bulk_moq_cost}` : '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {editingId === product.id ? (
                                                <>
                                                    <button
                                                        onClick={() => saveEdit(product.id)}
                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                        title="Save"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => startEdit(product)}
                                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProduct(product.id)}
                                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SellerInventory;
