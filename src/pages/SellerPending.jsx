
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerPending = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-yellow-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
                <p className="text-gray-600 mb-8">
                    Thank you for completing your registration! Our team is currently reviewing your documents. You will be notified via email once your shop is approved.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg text-left mb-8">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <CheckCircle size={16} /> What happens next?
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                        <li>We verify your business details.</li>
                        <li>We validate your KYC documents.</li>
                        <li>Approval usually takes 24-48 hours.</li>
                    </ul>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SellerPending;
