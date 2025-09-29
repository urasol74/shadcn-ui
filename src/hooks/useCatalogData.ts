import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseApi } from '@/lib/supabase-api';

interface Category {
    id: number;
    name: string;
}

export const useCatalogData = (gender: string | undefined, decodedSeason: string | null, isProduct: boolean | null) => {
    const [seasons, setSeasons] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Загрузка сезонов
    useEffect(() => {
        if (!gender || isProduct) return;
        const loadSeasons = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('season')
                    .eq('gender', gender)
                    .not('season', 'is', null)
                    .not('season', 'eq', '');
                if (error) throw error;
                const uniqueSeasons = [...new Set(data?.map(item => item.season).filter(Boolean))] as string[];
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
        if (!gender || isProduct) return;
        
        const loadCategories = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('products')
                    // Выбираем только данные по категории, так как это все, что нам нужно
                    .select('categories!inner(id, name), variants!inner(stock)') 
                    .eq('gender', gender)
                    .gt('variants.stock', 0); // Условие: хотя бы один вариант должен быть в наличии

                // Если выбран конкретный сезон, добавляем его в фильтр
                if (decodedSeason && decodedSeason !== 'all') {
                    query = query.eq('season', decodedSeason);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error fetching products to determine categories:', error);
                    throw error;
                }

                // Из полученного списка товаров, у которых есть остатки,
                // извлекаем их категории и убираем дубликаты.
                const uniqueCategoriesMap = new Map<number, Category>();
                data.forEach(product => {
                    const category = product.categories as Category;
                    if (category && !uniqueCategoriesMap.has(category.id)) {
                        uniqueCategoriesMap.set(category.id, category);
                    }
                });

                const uniqueCategories = Array.from(uniqueCategoriesMap.values());
                
                console.log('Отфильтрованные уникальные категории:', uniqueCategories);
                setCategories(uniqueCategories);

            } catch (error) {
                console.error('Categories loading failed:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadCategories();
    }, [gender, decodedSeason, isProduct]);

    return { seasons, categories, loading, setLoading };
};