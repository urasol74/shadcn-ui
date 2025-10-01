import React from 'react';
import { Link } from 'react-router-dom';

const CatalogImageIndex = () => {
    const brandColors = {
        primaryGreen: '#00A03E',
    };

    return (
        <section className="relative h-[70vh] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop')" }}>
            <div className="absolute inset-0" style={{ backgroundColor: 'rgb(129 128 128 / 30%)' }}></div>
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
                    <span className="block">Benetton</span>
                    <span className="block">
                        <span className="text-blue-600">Раскрась</span>{" "}
                        <span className="text-yellow-400">свой</span>{" "}
                        <span className="text-red-600">мир</span>
                    </span>
                </h1>
                <p className="mb-8 max-w-2xl text-lg">Откройте новую коллекцию, с разнообразием и ярким самовыражением!</p>
                <Link to="/gender/жiн/season/all">
                    <button
                        className="transform rounded-full px-12 py-3 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
                        style={{ backgroundColor: brandColors.primaryGreen }}
                    >
                        Каталог магазина
                    </button>
                </Link>
            </div>
        </section>
    );
};

export default CatalogImageIndex;
