import { supabase } from '../supabaseClient';

const AddProduct = () => {
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'

    const [product, setProduct] = useState({
        name: '',
        category: 'Groceries',
        price: '',
        minOrderQty: '',
        bulkPricePerUnit: '',
        barcode: '',
        // New Fields
        imageUrl: '',
        description: '',
        location: {
            latitude: 12.9716, // Default Mock
            longitude: 80.2534,
            area: 'T. Nagar',
            city: 'Chennai',
            state: 'TN'
        }
    });

    const [isSearching, setIsSearching] = useState(false);

    // Mock "Smart Image Search"
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSearching(true);
        // Simulate API delay
        setTimeout(() => {
            // Mock result based on random chance or filename
            setProduct(prev => ({
                ...prev,
                name: 'Organic Red Apple',
                category: 'Groceries',
                description: 'Fresh, crisp red apples from Kashmir. Sweet and juicy.',
                imageUrl: URL.createObjectURL(file), // Show local preview
                price: '45.00', // Suggested price
                // Auto-fill barcode for "smart" feel
                barcode: Date.now().toString().slice(-12)
            }));
            setIsSearching(false);
        }, 1500);
    };

    const generateBarcode = () => {
        // Simple mock EAN-13 generation
        const timestamp = Date.now().toString().slice(-12);
        setProduct({ ...product, barcode: timestamp });
    };

    const calculateBulkTotal = () => {
        if (product.minOrderQty && product.bulkPricePerUnit) {
            return (Number(product.minOrderQty) * Number(product.bulkPricePerUnit)).toFixed(2);
        }
        return '0.00';
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus(null);
        try {
            // 1. Create or Get Shop (For prototype, we'll just create one or use a fixed one)
            // In a real app, this comes from Auth context.
            // Let's check if we have a shop ID stored, else create one.
            let shopId = localStorage.getItem('proto_shop_id');

            if (!shopId) {
                const { data: shopData, error: shopError } = await supabase
                    .from('shops')
                    .insert([{
                        name: 'My Demo Shop',
                        latitude: product.location.latitude,
                        longitude: product.location.longitude,
                        area: product.location.area,
                        city: product.location.city,
                        state: product.location.state,
                        full_address: `${product.location.area}, ${product.location.city}`,
                        image_url: 'https://via.placeholder.com/150'
                    }])
                    .select()
                    .single();

                if (shopError) throw shopError;
                shopId = shopData.id;
                localStorage.setItem('proto_shop_id', shopId);
            }

            // 2. Insert Product
            const { error: productError } = await supabase
                .from('inventory_items')
                .insert([{
                    shop_id: shopId,
                    name: product.name,
                    category: product.category,
                    description: product.description,
                    image_url: product.imageUrl, // Note: In real app, upload file to Storage first!
                    barcode: product.barcode,
                    quantity_in_stock: 100, // Default mock
                    cost_per_unit: parseFloat(product.price) || 0,
                    min_moq: parseInt(product.minOrderQty) || 1,
                    bulk_moq_cost: parseFloat(product.bulkPricePerUnit) || null
                }]);

            if (productError) throw productError;

            setSaveStatus('success');
            // Reset form slightly or provide feedback
            setTimeout(() => setSaveStatus(null), 3000);

        } catch (error) {
            console.error('Error saving:', error);
            setSaveStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Add New Product
            </h2>

            <div className="space-y-6">

                {/* Smart Image Search */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3">
                        Step 1: Smart Product Lookup
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Product Image to Auto-Fill
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                            />
                        </div>
                    </div>
                    {isSearching && <p className="text-sm text-blue-600 mt-2 animate-pulse">Searching internet for product details...</p>}

                    {product.name && (
                        <div className="mt-4 p-3 bg-white rounded border border-blue-200 text-sm text-blue-800">
                            ✨ Smart Match: <strong>{product.name}</strong> identified!
                        </div>
                    )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Product Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g. Red Apple"
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        >
                            <option>Groceries</option>
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Hardware</option>
                        </select>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pricing Strategy</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Per Unit Price (₹)</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="40.00"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Bulk Pricing (Optional)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Min Order Qty</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="10"
                                        value={product.minOrderQty}
                                        onChange={(e) => setProduct({ ...product, minOrderQty: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-600">Bulk Price / Unit (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="35.00"
                                        value={product.bulkPricePerUnit}
                                        onChange={(e) => setProduct({ ...product, bulkPricePerUnit: e.target.value })}
                                    />
                                </div>
                            </div>
                            {product.minOrderQty && product.bulkPricePerUnit && (
                                <div className="mt-3 text-sm text-green-700 bg-green-50 p-2 rounded flex justify-between items-center">
                                    <span>Total for {product.minOrderQty} units:</span>
                                    <span className="font-bold">₹{calculateBulkTotal()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barcode Section */}
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Barcode</h3>
                        <button
                            onClick={generateBarcode}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                            <Scan className="w-4 h-4" /> Auto-Generate
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[100px] bg-white p-4 rounded-lg shadow-sm">
                        {product.barcode ? (
                            <>
                                <Barcode value={product.barcode} width={2} height={60} fontSize={14} />
                                <button className="mt-4 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center gap-2 transition">
                                    <Printer className="w-3 h-3" /> Print Sticker
                                </button>
                            </>
                        ) : (
                            <span className="text-gray-400 text-sm">No barcode generated yet</span>
                        )}
                    </div>
                </div>

                {/* Shop Location (Mock - normally auto-detected) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Shop Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input disabled className="bg-gray-100 p-2 rounded border" value={product.location.latitude} />
                        <input disabled className="bg-gray-100 p-2 rounded border" value={product.location.longitude} />
                        <input disabled className="bg-gray-100 p-2 rounded border col-span-2" value={`${product.location.area}, ${product.location.city}, ${product.location.state}`} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Location auto-detected from GPS</p>
                </div>

                {/* Actions */}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? (
                        <span>Saving...</span>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Product to Inventory
                        </>
                    )}
                </button>
                {saveStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-100 text-green-700 text-center rounded-lg">
                        Product saved successfully!
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 text-center rounded-lg">
                        Error saving product. Please check console/connection.
                    </div>
                )}

            </div>
        </div>
    );
};

export default AddProduct;
