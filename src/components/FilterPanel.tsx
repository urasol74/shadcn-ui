import { useState } from 'react';
import { Link } from 'react-router-dom';

// --- ТИПЫ --- //
interface Category {
    id: number;
    name: string;
}

interface GenderInfo {
    id: string;
    name: string;
}

interface FilterPanelProps {
    currentGender: string;
    currentSeason: string | null;
    selectedCategory: string | null;
    genders: GenderInfo[];
    seasons: string[];
    categories: Category[];
    onFilterChange?: () => void; // Этот prop используется как флаг для мобильной версии
}

// --- КОМПОНЕНТЫ --- //

// #region --- Desktop Components ---

/**
 * (ДЛЯ ДЕСКТОПА) Всплывающее окно с категориями при наведении.
 */
const SeasonPopover = ({ season, currentGender, currentSeason, selectedCategory, categories, onLinkClick }: any) => {
    const [isHovering, setIsHovering] = useState(false);
    const seasonDisplayName = season === 'all' ? 'Все сезоны' : season;
    const isActive = (currentSeason === season) || (season === 'all' && (currentSeason === 'all' || !currentSeason));

    const getCategoryLink = (catId: string) => `/gender/${currentGender}/season/${season}/category/${catId}`;
    const getAllCategoriesLink = () => `/gender/${currentGender}/season/${season}`;

    return (
        <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Link 
                to={getAllCategoriesLink()}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${isActive ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={onLinkClick}
            >
                {seasonDisplayName}
            </Link>
            {isHovering && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30">
                    <div className="w-max bg-white rounded-xl shadow-2xl border p-8"> 
                        <div className="grid grid-cols-3 gap-x-16 gap-y-4">
                            <Link to={getAllCategoriesLink()} className={`text-sm whitespace-nowrap ${!selectedCategory ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`} onClick={onLinkClick}>
                               Все категории
                            </Link>
                            {categories.map((category: Category) => (
                                <Link key={category.id} to={getCategoryLink(String(category.id))} className={`text-sm whitespace-nowrap ${String(selectedCategory) === String(category.id) ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`} onClick={onLinkClick}>
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// #endregion

/**
 * Основная панель фильтров с логикой для мобильной и десктопной версии.
 */
const FilterPanel = (props: FilterPanelProps) => {
    const { currentGender, currentSeason, selectedCategory, genders, seasons, categories, onFilterChange } = props;

    // Если onFilterChange передан, это мобильная версия.
    const isMobile = !!onFilterChange;

    if (!currentGender || !genders) return null;
    
    const allSeasons = ['all', ...seasons];

    // --- МОБИЛЬНАЯ ВЕРСИЯ --- //
    if (isMobile) {
        return (
            <div className="flex flex-col space-y-6">
                {/* 1. Блок выбора пола */}
                <div className="bg-gray-100 p-1 rounded-full grid grid-cols-2 gap-1">
                    {genders.map(gender => (
                        <Link
                            key={gender.id}
                            to={`/gender/${gender.id}/season/all`}
                            onClick={onFilterChange}
                            className={`px-4 py-2 rounded-full text-sm font-semibold text-center transition-all duration-300 ${currentGender === gender.id ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>
                            {gender.name}
                        </Link>
                    ))}
                </div>

                {/* 2. Блок сезонов */}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 px-3 pb-2">Сезоны</h4>
                    {allSeasons.map(season => {
                         const seasonDisplayName = season === 'all' ? 'Все сезоны' : season;
                         const isActive = (currentSeason === season) || (season === 'all' && !currentSeason);
                        return (
                            <Link
                                key={season}
                                to={`/gender/${currentGender}/season/${season}`}
                                onClick={onFilterChange}
                                className={`block px-3 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                {seasonDisplayName}
                            </Link>
                        )
                    })}
                </div>

                {/* 3. Блок категорий */}
                {categories.length > 0 && (
                     <div className="flex flex-col space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-gray-800 px-3 pb-2">Категории</h4>
                        <Link to={`/gender/${currentGender}/season/${currentSeason || 'all'}`} onClick={onFilterChange} className={`block px-3 py-2 rounded-md text-sm ${!selectedCategory ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                           Все категории
                        </Link>
                        {categories.map(category => (
                             <Link
                                key={category.id}
                                to={`/gender/${currentGender}/season/${currentSeason || 'all'}/category/${category.id}`}
                                onClick={onFilterChange}
                                className={`block px-3 py-2 rounded-md text-sm ${String(selectedCategory) === String(category.id) ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- ДЕСКТОПНАЯ ВЕРСИЯ --- //
    return (
        <div className="flex items-center justify-between w-full h-16"> 
            <div className="bg-gray-100 p-1 rounded-full flex items-center space-x-1">
                {genders.map(gender => (
                    <Link
                        key={gender.id}
                        to={`/gender/${gender.id}/season/all`}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${currentGender === gender.id ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                        {gender.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center space-x-3">
                {allSeasons.map(season => (
                    <SeasonPopover 
                        key={season} 
                        season={season} 
                        currentGender={currentGender}
                        currentSeason={currentSeason}
                        selectedCategory={selectedCategory}
                        categories={categories}
                        onLinkClick={onFilterChange} />
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
