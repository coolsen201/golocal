import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Briefcase, MapPin, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SellerKycBusiness = () => {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        mobileNumber: profile?.mobile_number || '', // Pre-fill if exists
        shopName: '',
        businessType: 'Kirana Store',
        natureOfBusiness: '',
        residentialAddress: '',
        businessAddress: '',
        isIndividual: true,
        latitude: 12.9716, // Default Chennai
        longitude: 80.2534
    });

    const MapUpdater = ({ center }) => {
        const map = useMap();
        map.flyTo(center, 13);
        return null;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Mobile Number: Allow only digits, max 10
        if (name === 'mobileNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Strict Mobile Validation
        if (formData.mobileNumber.length !== 10) {
            setError('Mobile Number must be exactly 10 digits.');
            setLoading(false);
            return;
        }

        try {
            if (!user) throw new Error('You must be logged in.');

            const updates = {
                id: user.id,
                mobile_number: formData.mobileNumber,
                residential_address: formData.residentialAddress,
                business_type: formData.businessType,
                nature_of_business: formData.natureOfBusiness,
                business_address: formData.businessAddress,
                is_individual: formData.isIndividual,
                approval_status: 'pending', // Keep as pending
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            // Create Shop with correct location
            if (formData.shopName) {
                const { error: shopError } = await supabase
                    .from('shops')
                    .insert({
                        owner_id: user.id,
                        name: formData.shopName,
                        full_address: formData.businessAddress,
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        image_url: 'https://via.placeholder.com/150'
                    });

                // Ignore duplicate key error if they retry
                if (shopError && shopError.code !== '23505') console.error('Shop create error', shopError);
            }

            // Refresh profile to ensure App.jsx sees the new mobile number
            await refreshProfile();

            navigate('/seller-onboarding/documents');

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-900 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Step 2: Business Details</h2>
                    <p className="opacity-80">Tell us about your shop</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    required
                                    maxLength="10"
                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Linked to Aadhaar (10 Digits)"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="shopName"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2"
                                    placeholder="Enter shop name"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                        <textarea
                            name="residentialAddress"
                            required
                            rows="2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2"
                            placeholder="Home Address"
                            value={formData.residentialAddress}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                name="businessAddress"
                                required
                                rows="2"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2"
                                placeholder="Shop Address"
                                value={formData.businessAddress}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Shop Location Map */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pin Your Shop Location</label>
                        <div className="h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0">
                            <MapContainer
                                center={[formData.latitude, formData.longitude]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <Marker
                                    position={[formData.latitude, formData.longitude]}
                                    draggable={true}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const marker = e.target;
                                            const position = marker.getLatLng();
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: position.lat,
                                                longitude: position.lng
                                            }));
                                        }
                                    }}
                                />
                                <MapUpdater center={[formData.latitude, formData.longitude]} />
                            </MapContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Drag the pin to your exact shop location.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                            <select
                                name="businessType"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={formData.businessType}
                                onChange={handleChange}
                            >
                                <option>Kirana Store</option>
                                <option>Retail Shop</option>
                                <option>Restaurant</option>
                                <option>Service Provider</option>
                                <option>Online Seller</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nature of Business</label>
                            <input
                                type="text"
                                name="natureOfBusiness"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="e.g. Grocery"
                                value={formData.natureOfBusiness}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-medium text-blue-900">Operating as Individual?</span>
                        <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isIndividual: true }))}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${formData.isIndividual ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                            >
                                Individual
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isIndividual: false }))}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${!formData.isIndividual ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                            >
                                Shop Owner
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg"
                    >
                        {loading ? 'Saving...' : 'Next: Upload Documents'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerKycBusiness;
