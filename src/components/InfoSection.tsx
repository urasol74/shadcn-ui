import React from 'react';

const InfoSection = () => {
    const brandColors = {
        primaryGreen: '#00A03E',
        darkGreen: '#004C22',
    };

    return (
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
                <h2 className="mb-4 text-3xl font-bold" style={{ color: brandColors.darkGreen }}>A Story of Color</h2>
                <p className="mb-6 text-gray-600">
                    Since 1965, United Colors of Benetton has woven a narrative of style that transcends borders. Our identity is built on vibrant colors, authentic fashion, and a commitment to a better future.
                </p>
                <a href="#" className="font-bold uppercase tracking-wider" style={{ color: brandColors.primaryGreen }}>
                    Learn More &rarr;
                </a>
            </div>
            <div className="order-1 h-80 w-full overflow-hidden rounded-lg shadow-xl md:order-2">
                 <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop" alt="Model posing in Benetton fashion" className="h-full w-full object-cover" />
            </div>
        </section>
    );
};

export default InfoSection;
