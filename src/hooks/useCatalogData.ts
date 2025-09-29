import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
    id: number;
    name: string;
}

export const useCatalogData = (gender: string | undefined, decodedSeason: string | null, isProduct: boolean | null) => {
    const [seasons, setSeasons] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true); // Начинаем с состояния загрузки

    useEffect(() => {
        if (!gender || isProduct) {
            setLoading(false);
            return;
        }

        const loadCatalogData = async () => {
            setLoading(true);
            try {
                // Запускаем загрузку сезонов и категорий параллельно для эффективности
                const [seasonsPromise, categoriesPromise] = [
                    supabase
                        .from('products')
                        .select('season')
                        .eq('gender', gender as string)
                        .not('season', 'is', null)
                        .not('season', 'eq', ''),
                    
                    (() => {
                        let query = supabase
                            .from('products')
                            .select('categories!inner(id, name), variants!inner(stock)')
                            .eq('gender', gender as string)
                            .gt('variants.stock', 0);

                        if (decodedSeason && decodedSeason !== 'all') {
                            query = query.eq('season', decodedSeason);
                        }
                        return query;
                    })()
                ];

                const [seasonsResult, categoriesResult] = await Promise.all([seasonsPromise, categoriesPromise]);

                // Обрабатываем результат сезонов
                if (seasonsResult.error) throw seasonsResult.error;
                const uniqueSeasons = [...new Set(seasonsResult.data?.map(item => item.season).filter(Boolean) ?? [])] as string[];
                setSeasons(uniqueSeasons);

                // Обрабатываем результат категорий
                if (categoriesResult.error) throw categoriesResult.error;
                const uniqueCategoriesMap = new Map<number, Category>();
                categoriesResult.data.forEach(product => {
                    // ИСПРАВЛЕНИЕ: Добавляем более строгую проверку типа для TypeScript.
                    // `!inner` join гарантирует, что `product.categories` - это объект,
                    // но TypeScript этого не знает. Эта проверка делает код безопасным.
                    const category = product.categories;
                    if (category && typeof category === 'object' && 'id' in category && 'name' in category) {
                        // Теперь, после проверки, приведение типа является безопасным.
                        const typedCategory = category as Category;
                        if (!uniqueCategoriesMap.has(typedCategory.id)) {
                            uniqueCategoriesMap.set(typedCategory.id, typedCategory);
                        }
                    }
                });
                const uniqueCategories = Array.from(uniqueCategoriesMap.values());
                setCategories(uniqueCategories);

            } catch (error) {
                console.error('Ошибка загрузки данных каталога:', error);
                setSeasons([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        loadCatalogData();
    }, [gender, decodedSeason, isProduct]);

    // Возвращаем данные и единый статус загрузки. `setLoading` больше не возвращается.
    return { seasons, categories, loading };
};