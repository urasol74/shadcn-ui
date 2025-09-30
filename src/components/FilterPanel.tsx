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
    onFilterChange?: () => void;
}

// --- КОМПОНЕНТЫ --- //

/**
 * Всплывающее окно с категориями, которое появляется при наведении на сезон.
 */
const SeasonPopover = ({ season, currentGender, currentSeason, selectedCategory, categories, onLinkClick }: any) => {
    const [isHovering, setIsHovering] = useState(false);
    const seasonDisplayName = season === 'all' ? 'Все сезоны' : season;
    const isActive = (currentSeason === season) || (season === 'all' && (currentSeason === 'all' || !currentSeason));

    const getCategoryLink = (catId: string) => `/gender/${currentGender}/season/${season}/category/${catId}`;
    const getAllCategoriesLink = () => `/gender/${currentGender}/season/${season}`;

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Кнопка сезона в виде таблетки (ИЗМЕНЕНО) */}
            <Link 
                to={getAllCategoriesLink()}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${ 
                    isActive 
                    ? 'bg-gray-100 text-gray-900 border border-gray-200' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={onLinkClick}
            >
                {seasonDisplayName}
            </Link>

            {/* Панель с категориями */}
            {isHovering && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30">
                    <div className="w-max bg-white rounded-xl shadow-2xl border p-8"> 
                        <div className="grid grid-cols-3 gap-x-16 gap-y-4">
                            <Link 
                                to={getAllCategoriesLink()} 
                                className={`text-sm whitespace-nowrap ${!selectedCategory ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                onClick={onLinkClick}
                            >
                               Все категории
                            </Link>
                            {categories.map((category: Category) => (
                                <Link 
                                    key={category.id} 
                                    to={getCategoryLink(String(category.id))} 
                                    className={`text-sm whitespace-nowrap ${String(selectedCategory) === String(category.id) ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                                    onClick={onLinkClick}
                                >
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

/**
 * Основная панель фильтров, объединяющая выбор пола и сезонов.
 */
const FilterPanel = (props: FilterPanelProps) => {
    if (!props.currentGender || !props.genders) return null;
    
    const allSeasons = ['all', ...props.seasons];

    return (
        <div className="flex items-center justify-between w-full h-16"> 
            
            {/* Левый блок: Переключатель полов */}
            <div className="bg-gray-100 p-1 rounded-full flex items-center space-x-1">
                {props.genders.map(gender => (
                    <Link
                        key={gender.id}
                        to={`/gender/${gender.id}/season/all`}
                        onClick={props.onFilterChange}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${ 
                            props.currentGender === gender.id 
                            ? 'bg-gray-800 text-white shadow-md' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {gender.name}
                    </Link>
                ))}
            </div>

            {/* Правый блок: Сезоны с Popover */}
            <div className="flex items-center space-x-3">
                {allSeasons.map(season => (
                    <SeasonPopover 
                        key={season} 
                        season={season} 
                        currentGender={props.currentGender}
                        currentSeason={props.currentSeason}
                        selectedCategory={props.selectedCategory}
                        categories={props.categories}
                        onLinkClick={props.onFilterChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
