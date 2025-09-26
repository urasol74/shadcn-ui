import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseApi } from '@/lib/supabase-api';

export const useCatalogData = (gender: string | undefined, decodedSeason: string | null, isProduct: boolean | null) => {
    const [seasons, setSeasons] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Загрузка сезонов через Supabase для текущей коллекции
    useEffect(() => {
        if (!gender || isProduct) return; // Не загружаем сезоны, если это товар
        
        const loadSeasons = async () => {
            try {
                console.log('Загрузка сезонов для коллекции:', gender);
                // Получаем уникальные сезоны для текущего пола
                const { data, error } = await supabase
                    .from('products')
                    .select('season')
                    .eq('gender', gender) // Используем точное совпадение
                    .not('season', 'is', null)
                    .not('season', 'eq', '');

                if (error) {
                    console.error('Seasons loading error:', error);
                    setSeasons([]);
                    return;
                }

                console.log('Полученные сезоны:', data);
                // Получаем уникальные значения сезонов
                const uniqueSeasons = [...new Set(data?.map(item => item.season).filter(Boolean))] as string[];
                console.log('Уникальные сезоны:', uniqueSeasons);
                setSeasons(uniqueSeasons);
            } catch (error) {
                console.error('Seasons loading failed:', error);
                setSeasons([]);
            }
        };
        
        loadSeasons();
    }, [gender, isProduct]);

    // Загрузка категорий
    useEffect(() => {
        if (!gender || isProduct) return; // Не загружаем категории, если это товар
        
        const loadCategories = async () => {
            try {
                console.log('Загрузка категорий для коллекции:', gender, 'сезон:', decodedSeason);
                console.log('Подготовка запроса категорий с параметрами:', { gender, decodedSeason });
                
                // Если у нас есть конкретный сезон (не "all"), загружаем только категории с товарами для этого сезона
                if (decodedSeason && decodedSeason !== 'all') {
                    // Сначала получаем все товары для сезона, затем фильтруем по наличию на складе
                    let query = supabase
                        .from('products')
                        .select(`
                            category_id,
                            categories(name)
                        `)
                        .eq('gender', gender) // Используем точное совпадение
                        .eq('season', decodedSeason); // Фильтр по сезону
                    
                    console.log('Запрос к Supabase для категорий:', query);

                    const { data, error } = await query;

                    if (error) {
                        console.error('Categories with products loading error:', error);
                        setCategories([]);
                        return;
                    }

                    console.log('Полученные категории с товарами:', data);
                    // Получаем уникальные категории
                    const uniqueCategories = (data && data.length > 0) ? data.reduce((acc, item) => {
                        if (item.category_id && !acc.find((cat: any) => cat.id === item.category_id)) {
                            acc.push({
                                id: item.category_id,
                                name: (item.categories as any)?.name || ''
                            });
                        }
                        return acc;
                    }, [] as Array<{id: number, name: string}>) : [];
                    
                    console.log('Уникальные категории с товарами:', uniqueCategories);
                    setCategories(uniqueCategories);
                } else {
                    // Если у нас "все сезоны" или нет сезона, загружаем все категории
                    const allCats = await supabaseApi.getCategories(gender);
                    setCategories(allCats);
                }
            } catch (error) {
                console.error('Categories loading failed:', error);
                // В случае ошибки пробуем загрузить все категории
                try {
                    const allCats = await supabaseApi.getCategories(gender);
                    setCategories(allCats);
                } catch (fallbackError) {
                    console.error('Fallback categories loading failed:', fallbackError);
                    setCategories([]);
                }
            }
        };
        
        loadCategories();
    }, [gender, decodedSeason, isProduct]);

    return { seasons, categories, loading, setLoading };
};