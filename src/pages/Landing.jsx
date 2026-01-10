import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [lang, setLang] = useState('en');

    const translations = {
        en: {
            title: '🛒 AI Lightspeed Sell',
            subtitle: 'Find Fast, Load Fast, Sell Fast',
            heroTitle: 'Hyperlocal Inventory Discovery',
            description: 'Connect with local sellers and discover products in your neighborhood. AI Lightspeed Sell makes it easy to find what you need from nearby shops, support local businesses, and get the best prices on products around you.',
            getStarted: 'Get Started'
        },
        ta: {
            title: '🛒 AI மின்னல் வேக விற்பனை',
            subtitle: 'விரைவாகத் தேடுங்கள், கடையை ஏற்றுங்கள், சீக்கிரம் விற்றுத் தள்ளுங்கள்',
            heroTitle: 'உள்ளூர் சரக்கு கண்டுபிடிப்பு',
            description: 'உள்ளூர் விற்பனையாளர்களுடன் இணைந்து உங்கள் அருகாமையில் உள்ள பொருட்களைக் கண்டறியுங்கள். கோலோக்கல் உங்களுக்குத் தேவையானவற்றை அருகிலுள்ள கடைகளில் எளிதாகக் கண்டுபிடிக்கவும், உள்ளூர் வணிகங்களை ஆதரிக்கவும், உங்களைச் சுற்றியுள்ள பொருட்களுக்கு சிறந்த விலையைப் பெறவும் உதவுகிறது.',
            getStarted: 'தொடங்குங்கள்'
        }
    };

    return (
        <div className="min-h-screen w-full transition-all duration-300 pb-20" style={{
            background: '#1E3A8A',
            fontFamily: lang === 'ta' ? "'Noto Sans Tamil', 'Segoe UI', sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Top Header Section */}
            <div className="relative w-full text-center pt-8 pb-4 px-4">
                <div className="absolute top-5 right-5 z-10">
                    <select
                        className="bg-white/20 border-2 border-white text-white font-bold py-2 px-4 rounded-full outline-none cursor-pointer"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                    >
                        <option value="en" className="bg-blue-600">English</option>
                        <option value="ta" className="bg-blue-600">தமிழ் (Tamil)</option>
                    </select>
                </div>

                <h1 className="text-white text-3xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-lg uppercase">
                    {translations[lang].heroTitle}
                </h1>

                <img
                    src="/Go-Local-1-10-2026.png"
                    alt="AI Lightspeed Sell"
                    className="max-w-[600px] w-full mx-auto mb-4 drop-shadow-2xl"
                />

                <p className="text-white text-2xl font-bold opacity-100 mb-8 italic">
                    {translations[lang].subtitle}
                </p>

                {/* Get Started Button - Now Above Images */}
                <div className="mb-12">
                    <Link
                        to="/login"
                        className="inline-block bg-white text-[#1E3A8A] py-5 px-16 rounded-full text-2xl font-black shadow-2xl hover:bg-gray-100 hover:-translate-y-1 hover:scale-105 transition-all uppercase tracking-wider"
                    >
                        {translations[lang].getStarted}
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full px-4 text-center">
                <div className="mb-12 max-w-4xl mx-auto">
                    <p className="text-white/90 text-xl md:text-2xl leading-relaxed font-medium">
                        {translations[lang].description}
                    </p>
                </div>

                {/* Larger Full-Width Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-2 md:px-12 w-full max-w-[1800px] mx-auto">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-8 border-white/10 transition-transform hover:-translate-y-4 duration-500">
                        <img src="/golocal1.png" alt="Seller Interface" className="w-full h-auto object-cover" />
                    </div>
                    <div className="rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-8 border-white/10 transition-transform hover:-translate-y-4 duration-500">
                        <img src="/golocal2.png" alt="Buyer Map" className="w-full h-auto object-cover" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
