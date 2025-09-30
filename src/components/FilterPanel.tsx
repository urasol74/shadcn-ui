
import { Link } from 'react-router-dom';

interface Category {
    id: number;
    name: string;
}

interface FilterPanelProps {
    gender: string | undefined;
    decodedSeason: string | null;
    selectedCategory: string | null;
    seasons: string[];
    categories: Category[];
    onFilterChange?: () => void; // Колбэк для закрытия мобильного меню
}

const FilterPanel = ({
    gender,
    decodedSeason,
    selectedCategory,
    seasons,
    categories,
    onFilterChange
}: FilterPanelProps) => {

    if (!gender) return null;

    const getSeasonLink = (seasonName: string) => selectedCategory ? 
        `/gender/${gender}/season/${encodeURIComponent(seasonName)}/category/${selectedCategory}` : 
        `/gender/${gender}/season/${encodeURIComponent(seasonName)}`;

    const getCategoryLink = (catId: string) => (decodedSeason && decodedSeason !== 'all') ? 
        `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}/category/${catId}` :
        `/gender/${gender}/season/all/category/${catId}`;

    const getAllCategoriesLink = () => (decodedSeason && decodedSeason !== 'all') ?
         `/gender/${gender}/season/${encodeURIComponent(decodedSeason)}` :
         `/gender/${gender}/season/all`;
    
    const handleLinkClick = () => {
        if (onFilterChange) {
            onFilterChange();
        }
    };

    return (
        // 1. УБИРАЕМ md:flex-row, чтобы контейнер всегда был вертикальным (flex-col)
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="font-semibold mb-3 text-lg">Сезоны</h3>
                {/* 2. Делаем кнопки сезонов всегда в строку с переносом */}
                <div className="flex flex-row flex-wrap gap-2 items-start">
                    <Link to={`/gender/${gender}/season/all`} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${!decodedSeason || decodedSeason === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={handleLinkClick}>Все сезоны</Link>
                    {seasons.map((seasonName) => (
                        <Link key={seasonName} to={getSeasonLink(seasonName)} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${decodedSeason === seasonName ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={handleLinkClick}>{seasonName}</Link>
                    ))}
                </div>
            </div>
            {/* 3. Делаем разделитель всегда горизонтальным */}
            <div className="border-t my-0"></div>
            <div>
                <h3 className="font-semibold mb-3 text-lg">Категории</h3>
                 {/* 4. Делаем кнопки категорий всегда в строку с переносом */}
                <div className="flex flex-row flex-wrap gap-2 items-start">
                    <Link to={getAllCategoriesLink()} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${!selectedCategory ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={handleLinkClick}>Все категории</Link>
                    {categories.map((category: Category) => (
                        <Link key={category.id} to={getCategoryLink(String(category.id))} className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${String(selectedCategory) === String(category.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={handleLinkClick}>{category.name}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;

