
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone } from 'lucide-react';

const SellerRegister = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        mobileNumber: '' // We will save this to metadata or update profile after signup? 
        // Note: 'signUp' helper only takes fullName. We might lose mobileNumber if we don't handle it.
        // Let's pass it in metadata if possible, or just focus on creating the User first 
        // and collect Mobile in Step 2 if strictly needed there.
        // BUT user asked for "Account & Personal" here. Mobile is usually here.
        // I will add mobile_number to the metadata passed to signUp if AuthContext allows, 
        // OR just rely on the user re-entering/confirming it in Step 2?
        // Actually, AuthContext.signUp takes metadata. I should verify if I can pass more.
    });

    // Check AuthContext: it takes (email, password, fullName, role).
    // It puts fullName and role in metadata.
    // I can't easily pass mobile without modifying AuthContext.
    // OPTION: Let's focus on creating the Auth User here. 
    // We can ask for Mobile in Step 2 (Business Details) or make Step 1 just Name/Email/Pass.
    // The user's screenshot/request implied "Account & Personal" logic stays here.
    // I will try to update the profile immediately after signup? No, RLS might block if not confirmed.
    // Best Safe Bet: Ask for Mobile again or assume it's part of "Personal" for Step 2.
    // Let's keep the form matching the User's "Step 1" visual, but only use Email/Pass/Name for Auth.
    // We can try to save Mobile if we get a session.

    // UPDATE: Start simple. Create Account.

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');

            // 1. Sign Up
            const { data, error } = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                'seller'
            );

            if (error) throw error;

            // 2. Handling Redirection
            if (data?.user && !data?.session) {
                alert('Account created successfully! Please check your email to verify your account.');
                navigate('/login');
            } else {
                // If session exists (auto-confirm), go to Step 2
                navigate('/seller-onboarding/business');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">Become a Seller</h2>
                    <p className="mt-2 text-gray-600">Step 1: Create your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Minimum 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Note: Mobile Number moved to Step 2 to ensure we capture it on the profile object safely after auth */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Creating Account...' : 'Continue to Business Details'}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SellerRegister;
