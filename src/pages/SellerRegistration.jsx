import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { ShieldCheck, Building2, MapPin, Calculator, CreditCard, UploadCloud, ClipboardCheck } from 'lucide-react';

const SellerRegistration = () => {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        mobile_number: profile?.phone || '',
        business_type: '',
        business_address: '',
        pan_number: '',
        gstin: '',
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    approval_status: 'pending'
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage('Registration submitted successfully! Please wait for admin approval.');
            // Reload window to trigger profile refresh in AuthContext
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (profile?.approval_status === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-yellow-500">
                    <ClipboardCheck className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Pending</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for submitting your details. Our team is currently reviewing your registration for "AI Lightspeed Sell".
                    </p>
                    <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
                        You will be able to access the seller dashboard once your account is approved.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <img src="/Go-Local.gif" alt="GoLocal" className="mx-auto mb-4" style={{ maxWidth: '200px' }} />
                    <h2 className="text-3xl font-extrabold text-gray-900">Seller Verification</h2>
                    <p className="mt-2 text-gray-600">Complete your profile to start selling on GoLocal Marketplace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-2xl rounded-3xl p-8 md:p-12">
                    {/* Section 1: Basic Info */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-blue-700">
                            <Building2 className="w-5 h-5" />
                            <h3 className="text-lg font-bold uppercase tracking-wider">1. Business Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <input name="mobile_number" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.mobile_number} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                <select name="business_type" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.business_type} onChange={handleChange}>
                                    <option value="">Select Type</option>
                                    <option value="Proprietorship">Proprietorship</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="LLP">LLP</option>
                                    <option value="Pvt. Ltd. Company">Pvt. Ltd. Company</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Business Address</label>
                                <textarea name="business_address" required rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.business_address} onChange={handleChange}></textarea>
                            </div>
                        </div>
                    </section>

                    <hr />

                    {/* Section 2: ID & Tax */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-green-700">
                            <ShieldCheck className="w-5 h-5" />
                            <h3 className="text-lg font-bold uppercase tracking-wider">2. Identity & Tax Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                                <input name="pan_number" required placeholder="ABCDE1234F" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.pan_number} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                                <input name="gstin" required placeholder="22AAAAA0000A1Z5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.gstin} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    <hr />

                    {/* Section 3: Bank Details */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-purple-700">
                            <CreditCard className="w-5 h-5" />
                            <h3 className="text-lg font-bold uppercase tracking-wider">3. Bank Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                <input name="bank_name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.bank_name} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                <input name="account_number" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.account_number} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                                <input name="ifsc_code" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.ifsc_code} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-12 py-4 rounded-full font-bold hover:bg-green-700 transition disabled:bg-gray-400 shadow-xl hover:-translate-y-1"
                        >
                            {loading ? 'Submitting...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SellerRegistration;
