import React from 'react';

const InfoSection = () => {
    const brandColors = {
        primaryGreen: '#00A03E',
        darkGreen: '#004C22',
    };

    return (
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
                <h2 className="mb-4 text-3xl font-bold" style={{ color: brandColors.darkGreen }}>История, написанная цветом</h2>
                <p className="mb-6 text-gray-600">
                    С 1965 года United Colors of Benetton создает историю стиля, которая не знает границ. Наша идентичность построена на ярких цветах, аутентичной моде и стремлении к лучшему будущему. Мы верим в мир, где разнообразие — это ценность.
                </p>
                <a href="#" className="font-bold uppercase tracking-wider" style={{ color: brandColors.primaryGreen }}>
                    Узнать больше &rarr;
                </a>
            </div>
            <div className="order-1 h-80 w-full overflow-hidden rounded-lg shadow-xl md:order-2">
                 <img 
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop" 
                    alt="Модель в одежде Benetton" 
                    width="1887" 
                    height="2831" 
                    className="h-full w-full object-cover" />
            </div>
        </section>
    );
};

export default InfoSection;
