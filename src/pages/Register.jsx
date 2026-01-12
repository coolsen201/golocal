import { Link } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#1E3A8A' }}>
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side */}
                <div
                    className="md:w-1/2 p-12 text-yellow-300 flex flex-col justify-center relative relative overflow-hidden"
                    style={{
                        backgroundImage: "url('/shop1.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Overlay for transparency */}
                    <div className="absolute inset-0 bg-black/50 z-0"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Join GoLocal</h2>
                        <p className="text-lg opacity-90 mb-8 font-medium">
                            The AI-powered hyperlocal marketplace that connects you to your neighborhood instantly.
                        </p>
                        <ul className="space-y-4 text-lg font-medium">
                            <li className="flex items-center gap-3">
                                <span className="bg-white/20 p-1 rounded-full">✓</span> Instant Local Delivery
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="bg-white/20 p-1 rounded-full">✓</span> Verified Trusted Sellers
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="bg-white/20 p-1 rounded-full">✓</span> Best Prices Nearby
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Selection Side */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">Choose Account Type</h3>
                        <p className="text-gray-500">How would you like to use GoLocal?</p>
                    </div>

                    <div className="space-y-6">
                        <Link
                            to="/buyerregister"
                            className="group block p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-lg transition duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                                    <ShoppingCart className="w-8 h-8 text-blue-600 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-gray-800">I am a Buyer</h4>
                                    <p className="text-sm text-gray-500 mt-1">Shop from local stores, get fast delivery</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/sellerregister"
                            className="group block p-6 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                                    <Store className="w-8 h-8 text-purple-600 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-gray-800">I am a Seller</h4>
                                    <p className="text-sm text-gray-500 mt-1">List products, manage inventory, grow sales</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
