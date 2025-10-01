import React from 'react';

const Footer = () => {
    const brandColors = {
        darkGreen: '#004C22',
    };

    return (
        <footer className="py-12 mt-auto" style={{ backgroundColor: brandColors.darkGreen }}>
            <div className="container mx-auto px-6 text-center text-white">
            <p className="mb-4 text-xl font-bold">UNITED COLORS OF BENETTON</p>
            <div className="mb-6 flex justify-center space-x-6">
                <a href="#" className="hover:underline">Instagram</a>
                <a href="#" className="hover:underline">Facebook</a>
                <a href="#" className="hover:underline">Twitter</a>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Benetton Group S.r.l. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
