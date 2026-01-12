
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Camera, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';

const SellerKycDocuments = () => {
    const navigate = useNavigate();
    const { user, refreshProfile, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [files, setFiles] = useState({
        aadhaar: null,
        selfie: null,
        shopPhoto: null
    });

    const [previews, setPreviews] = useState({
        aadhaar: null,
        selfie: null,
        shopPhoto: null
    });

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const uploadFile = async (file, path) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('kyc-documents')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!user) throw new Error('You must be logged in.');

            // Validate all files present
            if (!files.aadhaar || !files.selfie || !files.shopPhoto) {
                throw new Error('All documents are mandatory.');
            }

            // Upload in parallel
            const [aadhaarUrl, selfieUrl, shopPhotoUrl] = await Promise.all([
                uploadFile(files.aadhaar, `aadhaar/${user.id}`),
                uploadFile(files.selfie, `selfies/${user.id}`),
                uploadFile(files.shopPhoto, `shops/${user.id}`)
            ]);

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    aadhaar_card_url: aadhaarUrl,
                    selfie_url: selfieUrl,
                    shop_photo_url: shopPhotoUrl,
                    approval_status: 'pending', // Explicitly pending now
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Also update any shop entry with the image if it exists
            // We do this blindly attempting to update shop owned by user
            await supabase
                .from('shops')
                .update({ image_url: shopPhotoUrl })
                .eq('owner_id', user.id);

            // Refresh profile to update context state
            await refreshProfile();

            // Sign out and redirect to login as per user request
            await signOut();
            navigate('/login');

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
                    <h2 className="text-2xl font-bold">Step 3: Verification Documents</h2>
                    <p className="opacity-80">Upload proof to activate your shop</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && <div className="text-red-500 bg-red-50 p-3 rounded flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                        <p className="font-bold">Mandatory Uploads</p>
                        <p>ensure photos are clear.</p>
                    </div>

                    {/* Aadhaar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition">
                            <input type="file" accept="image/*,.pdf" id="aadhaar" className="hidden" onChange={(e) => handleFileChange(e, 'aadhaar')} />
                            <label htmlFor="aadhaar" className="cursor-pointer block">
                                {previews.aadhaar ? (
                                    <img src={previews.aadhaar} alt="Preview" className="h-40 mx-auto object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                        <span className="text-blue-600 font-medium">Click to Upload</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Selfie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Selfie</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition">
                            <input type="file" accept="image/*" id="selfie" capture="user" className="hidden" onChange={(e) => handleFileChange(e, 'selfie')} />
                            <label htmlFor="selfie" className="cursor-pointer block">
                                {previews.selfie ? (
                                    <img src={previews.selfie} alt="Preview" className="h-40 w-40 rounded-full mx-auto object-cover border-4 border-white shadow" />
                                ) : (
                                    <>
                                        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                        <span className="text-blue-600 font-medium">Take Selfie</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Shop Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Photo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition">
                            <input type="file" accept="image/*" id="shopPhoto" className="hidden" onChange={(e) => handleFileChange(e, 'shopPhoto')} />
                            <label htmlFor="shopPhoto" className="cursor-pointer block">
                                {previews.shopPhoto ? (
                                    <img src={previews.shopPhoto} alt="Preview" className="h-40 mx-auto object-contain" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                        <span className="text-blue-600 font-medium">Upload Shop Photo</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                    >
                        {loading ? 'Uploading...' : 'Submit & Finish'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerKycDocuments;
