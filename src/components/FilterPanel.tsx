import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

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

// #region --- Desktop Components (REWORKED) ---
const SeasonPopover = ({ season, currentGender, currentSeason, selectedCategory, onLinkClick, isLast }: any) => {
    const [isHovering, setIsHovering] = useState(false);
    const [popoverCategories, setPopoverCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const seasonDisplayName = season === 'all' ? 'Все сезоны' : season;
    const isActive = (currentSeason === season) || (season === 'all' && (currentSeason === 'all' || !currentSeason));
    const getCategoryLink = (catId: string) => `/gender/${currentGender}/season/${season}/category/${catId}`;
    const getAllCategoriesLink = () => `/gender/${currentGender}/season/${season}`;

    const popoverPositionClass = isLast ? 'right-0' : 'left-1/2 -translate-x-1/2';

    useEffect(() => {
        // Загружаем категории только при наведении и если они еще не были загружены
        if (isHovering && popoverCategories.length === 0 && !isLoading) {
            const fetchPopoverCategories = async () => {
                setIsLoading(true);

                let productsQuery = supabase
                    .from('products')
                    .select('category_id, variants!inner(stock)')
                    .not('category_id', 'is', null)
                    .eq('gender', currentGender)
                    .gt('variants.stock', 0);

                if (season && season !== 'all') {
                    productsQuery = productsQuery.eq('season', season);
                }

                const { data: productsData, error: productsError } = await productsQuery;

                if (productsError || !productsData || productsData.length === 0) {
                    setPopoverCategories([]);
                    setIsLoading(false);
                    return;
                }

                const categoryIds = [...new Set(productsData.map(p => p.category_id))];

                if (categoryIds.length === 0) {
                    setPopoverCategories([]);
                    setIsLoading(false);
                    return;
                }

                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('id, name')
                    .in('id', categoryIds)
                    .order('name', { ascending: true });

                setPopoverCategories(categoriesData || []);
                setIsLoading(false);
            };

            fetchPopoverCategories();
        }
    }, [isHovering, popoverCategories.length, isLoading, currentGender, season]);

    return (
        <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <Link 
                to={getAllCategoriesLink()}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${isActive ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={onLinkClick}>
                {seasonDisplayName}
            </Link>
            {isHovering && (
                <div className={`absolute top-full z-30 ${popoverPositionClass}`}>
                    <div className="pt-2"> {/* Этот div создает "безопасную" прозрачную зону */}
                        <div className="w-max bg-white rounded-xl shadow-2xl border p-8 min-w-[300px]">
                            {isLoading ? (
                                <div className="text-center py-4 text-gray-500 text-sm">Загрузка...</div>
                            ) : popoverCategories.length > 0 ? (
                                <div className="grid grid-cols-3 gap-x-16 gap-y-4">
                                    <Link to={getAllCategoriesLink()} className={`text-sm whitespace-nowrap ${!selectedCategory ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`} onClick={onLinkClick}>
                                       Все категории
                                    </Link>
                                    {popoverCategories.map((category: Category) => (
                                        <Link key={category.id} to={getCategoryLink(String(category.id))} className={`text-sm whitespace-nowrap ${String(selectedCategory) === String(category.id) ? 'text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'}`} onClick={onLinkClick}>
                                            {category.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">Нет категорий</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
// #endregion

const FilterPanel = (props: FilterPanelProps) => {
    const { currentGender, currentSeason, selectedCategory, genders, seasons, onFilterChange } = props;
    const isMobile = !!onFilterChange;

    if (!currentGender || !genders) return null;
    
    const allSeasonsInitial = ['all', ...seasons];

    // --- МОБИЛЬНАЯ ВЕРСИЯ (без изменений) --- //
    if (isMobile) {
        const navigate = useNavigate();
        
        const [selection, setSelection] = useState({
            gender: currentGender,
            season: currentSeason,
            category: selectedCategory,
        });

        const [panelCategories, setPanelCategories] = useState<Category[]>([]);
        const [isPanelDataLoading, setIsPanelDataLoading] = useState(true);

        useEffect(() => {
            const fetchPanelData = async () => {
                if (!selection.gender) return;
                setIsPanelDataLoading(true);
                let productsQuery = supabase.from('products').select('category_id, variants!inner(stock)').not('category_id', 'is', null).eq('gender', selection.gender).gt('variants.stock', 0);
                if (selection.season && selection.season !== 'all') { productsQuery = productsQuery.eq('season', selection.season); }
                const { data: productsData, error: productsError } = await productsQuery;
                if (productsError || !productsData) { setPanelCategories([]); setIsPanelDataLoading(false); return; }
                const categoryIds = [...new Set(productsData.map(p => p.category_id))];
                if (categoryIds.length === 0) { setPanelCategories([]); setIsPanelDataLoading(false); return; }
                const { data: categoriesData } = await supabase.from('categories').select('id, name').in('id', categoryIds).order('name', { ascending: true });
                setPanelCategories(categoriesData || []);
                setIsPanelDataLoading(false);
            };
            fetchPanelData();
        }, [selection.gender, selection.season]);


        const handleGenderSelect = (genderId: string) => { setSelection({ gender: genderId, season: 'all', category: null }); };
        const handleSeasonSelect = (season: string) => { if (selection.season === season) return; setSelection({ ...selection, season: season, category: null }); };
        const handleCategorySelect = (categoryId: string | null) => { setSelection({ ...selection, category: categoryId }); };
        const handleApply = () => {
            const { gender, season, category } = selection;
            let path = `/gender/${gender}/season/${season || 'all'}`;
            if (category) { path += `/category/${category}`; }
            navigate(path);
            if (onFilterChange) { onFilterChange(); }
        };

        return (
            <div className="flex flex-col flex-1 min-h-0 pt-4">
                <div className="flex-1 overflow-y-auto px-4">
                    <div className=""><h4 className="font-semibold text-gray-800 px-3 pb-3">Пол</h4><div className="bg-gray-100 p-1 rounded-full grid grid-cols-4 gap-1">{genders.map(gender => (<button key={gender.id} onClick={() => handleGenderSelect(gender.id)} className={`px-2 py-2 text-xs text-center font-semibold rounded-full transition-all duration-300 ${selection.gender === gender.id ? 'bg-white text-gray-900 shadow' : 'text-gray-500'}`}>{gender.name}</button>))}</div></div>
                    <div className="mt-6"><h4 className="font-semibold text-gray-800 px-3 pb-2">Сезоны</h4><div className="flex flex-col space-y-1">{allSeasonsInitial.map(season => { const sn = season === 'all' ? 'Все сезоны' : season; const ia = (selection.season === season) || (season === 'all' && !selection.season); return (<button key={season} onClick={() => handleSeasonSelect(season)} className={`block w-full text-left px-3 py-2 rounded-md text-sm ${ia ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>{sn}</button>)})}</div></div>
                    <div className="mt-6"><h4 className="font-semibold text-gray-800 px-3 pb-2">Категории</h4>{isPanelDataLoading ? (<div className="text-center py-4 text-gray-500 text-sm">Загрузка...</div>) : panelCategories.length > 0 ? (<div className="grid grid-cols-2 gap-1"><button onClick={() => handleCategorySelect(null)} className={`block w-full text-left col-span-2 px-3 py-2 rounded-md text-sm ${!selection.category ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                    Все категории
                                </button>{panelCategories.map(category => (<button key={category.id} onClick={() => handleCategorySelect(String(category.id))} className={`block w-full text-left px-3 py-2 rounded-md text-sm truncate ${String(selection.category) === String(category.id) ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600'}`}>{category.name}</button>))}</div>) : (<div className="text-center py-4 text-gray-500 text-sm">Нет категорий</div>)}</div>
                </div>
                <div className="p-4 border-t bg-white"><Button onClick={handleApply} className="w-full h-12 text-base font-bold">{isPanelDataLoading ? 'Загрузка...' : 'Показать'}</Button></div>
            </div>
        );
    }

    // --- ДЕСКТОПНАЯ ВЕРСИЯ (ИСПРАВЛЕНО) --- //
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
                {allSeasonsInitial.map((season, index) => (
                    <SeasonPopover 
                        key={season} 
                        season={season} 
                        currentGender={currentGender}
                        currentSeason={currentSeason}
                        selectedCategory={selectedCategory}
                        isLast={index === allSeasonsInitial.length - 1}
                         />
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
