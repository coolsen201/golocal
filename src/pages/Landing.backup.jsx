import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [lang, setLang] = useState('en');

    const translations = {
        en: {
            title: '🛒 AI Lightspeed Sell',
            subtitle: 'Find Fast. Sell Fast, Buy Fast',
            heroTitle: 'AI Hyperlocal local market',
            description: 'Connect with local sellers and discover products in your neighborhood. AI Lightspeed Sell makes it easy to find what you need from nearby shops, support local businesses, and get the best prices on products around you.',
            getStarted: 'Get Started'
        },
        ta: {
            title: '🛒 AI மின்னல் வேக விற்பனை',
            subtitle: 'விரைவாகத் தேடுங்கள். சீக்கிரம் விற்றுத் தள்ளுங்கள். சீக்கிரம் வாங்குங்கள்.',
            heroTitle: 'AI ஹைப்பர்லோகல் உள்ளூர் சந்தை',
            description: 'உள்ளூர் விற்பனையாளர்களுடன் இணைந்து உங்கள் அருகாமையில் உள்ள பொருட்களைக் கண்டறியுங்கள். AI மின்னல் வேக விற்பனை உங்களுக்குத் தேவையானவற்றை அருகிலுள்ள கடைகளில் எளிதாகக் கண்டுபிடிக்கவும், உள்ளூர் வணிகங்களை ஆதரிக்கவும், உங்களைச் சுற்றியுள்ள பொருட்களுக்கு சிறந்த விலையைப் பெறவும் உதவுகிறது.',
            getStarted: 'தொடங்குங்கள்'
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden flex flex-col items-center justify-between py-4 text-center relative"
            style={{
                backgroundColor: '#edebe4',
                fontFamily: lang === 'ta' ? "'Noto Sans Tamil', 'Segoe UI', sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>

            {/* Language Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <select
                    className="bg-black/5 border border-black/10 text-black text-xs py-1 px-3 rounded-md outline-none cursor-pointer"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                </select>
            </div>

            {/* 1. Logo (Top of Page) */}
            <div className="w-full max-w-4xl flex justify-center">
                <img
                    src="/Go-Local-1-10-2026.png"
                    alt="Go Local"
                    className="max-h-24 md:max-h-40 w-auto drop-shadow-2xl"
                />
            </div>

            {/* 2. CTA Button (Orange) */}
            <Link
                to="/login"
                className="inline-block bg-orange-600 text-white py-3 px-12 rounded-full text-xl md:text-2xl font-black shadow-xl hover:bg-orange-700 hover:-translate-y-1 transition-all uppercase tracking-widest"
            >
                {translations[lang].getStarted}
            </Link>

            {/* 3. Hero Title (Yellow - Not all caps) */}
            <h1 className="text-yellow-500 text-3xl md:text-6xl font-black tracking-tighter drop-shadow-sm">
                {translations[lang].heroTitle}
            </h1>

            {/* 4. Description (Two Lines) */}
            <div className="w-full max-w-5xl px-4">
                <p className="text-black font-bold m-0 tracking-tight leading-snug"
                    style={{ fontSize: '1.35vw' }}>
                    {translations[lang].description}
                </p>
            </div>



            {/* 6. Tagline (Footer) */}
            <div className="w-full pb-2 px-10">
                <p className="text-black text-xl md:text-3xl font-black italic tracking-widest leading-none m-0 whitespace-nowrap">
                    {translations[lang].subtitle}
                </p>
            </div>
        </div>
    );
};

export default Landing;
