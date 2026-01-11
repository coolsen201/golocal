import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    const [lang, setLang] = useState('en');

    const translations = {
        en: {
            title: '🛒 AI Lightspeed Sell',
            subtitle: 'Find Fast, Sell Fast, Buy Fast',
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
        <div className="min-h-screen w-full flex flex-col overflow-hidden relative"
            style={{
                backgroundColor: '#1E3A8A', // Blue background
                fontFamily: lang === 'ta' ? "'Noto Sans Tamil', 'Segoe UI', sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>

            {/* Language Toggle (Absolute Top Right) */}
            <div className="absolute top-2 right-2 z-50">
                <select
                    className="bg-white/20 border border-black/20 text-black text-xs py-1 px-2 rounded-md outline-none cursor-pointer"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                </select>
            </div>

            {/* HEADER: Logo (Left) vs Tagline (Right) */}
            <div className="flex justify-between items-center w-full px-4 md:px-10 py-6">
                {/* Logo - REDUCED SIZE (65% smaller) */}
                <div>
                    <img
                        src="/Go-Local.gif"
                        alt="Go Local"
                        className="h-12 md:h-20 w-auto drop-shadow-xl"
                    />
                </div>

                {/* Tagline - YELLOW */}
                <div className="text-right pt-2 md:pt-0 max-w-[50%]">
                    <p className="text-yellow-400 text-xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-md">
                        {translations[lang].subtitle}
                    </p>
                </div>
            </div>

            {/* HERO SECTION: Title (White) + Description (Yellow) */}
            <div className="flex flex-col items-center justify-center text-center px-4 md:px-8 mb-6 mt-4">
                <h1 className="text-white text-5xl md:text-8xl font-black tracking-tighter mb-6 drop-shadow-lg">
                    {translations[lang].heroTitle}
                </h1>

                <p className="text-yellow-400 font-bold text-sm md:text-xl tracking-wide leading-relaxed max-w-7xl mx-auto drop-shadow-md">
                    {translations[lang].description}
                </p>

                {/* CTA Button - 3D Shining Yellow */}
                <div className="mt-8">
                    <Link
                        to="/login"
                        className="inline-block bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-yellow-900 py-4 px-12 rounded-full text-2xl font-black shadow-[0_6px_0_rgb(161,98,7)] active:shadow-[0_2px_0_rgb(161,98,7)] active:translate-y-1 hover:brightness-110 active:brightness-95 transition-all uppercase tracking-wider relative overflow-hidden group"
                    >
                        <span className="relative z-10 drop-shadow-sm">{translations[lang].getStarted}</span>
                        {/* Shine Effect */}
                        <div className="absolute top-0 -inset-full h-full w-full z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                    </Link>
                </div>
            </div>

            {/* IMAGE GRID: Side-by-Side */}
            <div className="flex-grow w-full grid grid-cols-2 gap-0 overflow-hidden">
                <div className="relative w-full h-full">
                    <img
                        src="/golocal3.png"
                        alt="Buyer Experience"
                        className="absolute inset-0 w-full h-full object-contain object-bottom"
                        style={{ backgroundColor: '#fff' }} // White bg to match infographic style if transparent
                    />
                </div>
                <div className="relative w-full h-full">
                    <img
                        src="/golocal2.png"
                        alt="Seller Experience"
                        className="absolute inset-0 w-full h-full object-contain object-bottom"
                        style={{ backgroundColor: '#fff' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Landing;
