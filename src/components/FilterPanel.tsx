import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
    onFilterChange?: () => void; // Флаг для мобильной версии
}

// #region --- Desktop Components ---
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
                onClick={onLinkClick}>
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

const FilterPanel = (props: FilterPanelProps) => {
    const { currentGender, currentSeason, selectedCategory, genders, seasons, categories, onFilterChange } = props;
    const isMobile = !!onFilterChange;

    if (!currentGender || !genders) return null;
    
    const allSeasons = ['all', ...seasons];

    // --- МОБИЛЬНАЯ ВЕРСИЯ (НОВАЯ ЛОГИКА) --- //
    if (isMobile) {
        const navigate = useNavigate();
        
        const [selection, setSelection] = useState({
            gender: currentGender,
            season: currentSeason,
            category: selectedCategory,
        });

        const handleGenderSelect = (genderId: string) => {
            setSelection({ gender: genderId, season: 'all', category: null });
        };

        const handleSeasonSelect = (season: string) => {
            if (selection.season === season) return;
            setSelection({ ...selection, season: season, category: null });
        };

        const handleCategorySelect = (categoryId: string | null) => {
            setSelection({ ...selection, category: categoryId });
        };
        
        const handleApply = () => {
            const { gender, season, category } = selection;
            let path = `/gender/${gender}/season/${season || 'all'}`;
            if (category) {
                path += `/category/${category}`;
            }
            navigate(path);
            if (onFilterChange) {
                onFilterChange();
            }
        };

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <h4 className="font-semibold text-gray-800 px-3 pb-3">Пол</h4>
                        <div className="bg-gray-100 p-1 rounded-full grid grid-cols-4 gap-1">
                            {genders.map(gender => (
                                <button
                                    key={gender.id}
                                    onClick={() => handleGenderSelect(gender.id)}
                                    className={`px-2 py-2 text-xs text-center font-semibold rounded-full transition-all duration-300 ${selection.gender === gender.id ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>
                                    {gender.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 pt-0">
                        <h4 className="font-semibold text-gray-800 px-3 pb-2">Сезоны</h4>
                        <div className="flex flex-col space-y-1">
                            {allSeasons.map(season => {
                                const seasonDisplayName = season === 'all' ? 'Все сезоны' : season;
                                const isActive = (selection.season === season) || (season === 'all' && !selection.season);
                                return (
                                    <button
                                        key={season}
                                        onClick={() => handleSeasonSelect(season)}
                                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        {seasonDisplayName}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {categories.length > 0 && (
                        <div className="p-4 pt-0">
                            <h4 className="font-semibold text-gray-800 px-3 pb-2">Категории</h4>
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => handleCategorySelect(null)}
                                    className={`block w-full text-left col-span-2 px-3 py-2 rounded-md text-sm ${!selection.category ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                    Все категории
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategorySelect(String(category.id))}
                                        className={`block w-full text-left px-3 py-2 rounded-md text-sm truncate ${String(selection.category) === String(category.id) ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white">
                    <Button onClick={handleApply} className="w-full h-12 text-base font-bold">
                        Показать
                    </Button>
                </div>
            </div>
        );
    }

    // --- ДЕСКТОПНАЯ ВЕРСИЯ (БЕЗ ИЗМЕНЕНИЙ) --- //
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
