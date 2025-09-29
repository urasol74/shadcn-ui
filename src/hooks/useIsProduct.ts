import { useEffect, useState } from 'react';
import { supabaseApi } from '@/lib/supabase-api';

/**
 * Хук для определения, является ли параметр в URL артикулом товара.
 * Логика упрощена для устранения циклических зависимостей и лишних запросов.
 */
export const useIsProduct = (potentialArticle: string | null, categoryId: string | undefined) => {
    const [isProduct, setIsProduct] = useState<boolean | null>(null);
    const [productData, setProductData] = useState<any>(null);

    useEffect(() => {
        // Сбрасываем состояние при каждом новом рендере, чтобы избежать старых данных
        setIsProduct(null);
        setProductData(null);

        // 1. Быстрая проверка: если есть ID категории или параметр "all", это точно не товар.
        if (categoryId || !potentialArticle || potentialArticle === 'all') {
            setIsProduct(false);
            return;
        }

        // 2. Решающая проверка: делаем ОДИН запрос для определения, существует ли товар.
        const checkProduct = async () => {
            try {
                const data = await supabaseApi.getProduct(potentialArticle);
                if (data && data.product) {
                    // Товар найден
                    setIsProduct(true);
                    setProductData(data);
                } else {
                    // Товар не найден, значит, это страница сезона
                    setIsProduct(false);
                }
            } catch (error) {
                // В случае ошибки (недоступность API и т.д.) считаем, что это не товар
                console.error('Ошибка при выполнении проверки товара:', error);
                setIsProduct(false);
            }
        };

        checkProduct();

    // 3. Зависимость ТОЛЬКО от параметров URL. Хук не будет перезапускаться без надобности.
    }, [potentialArticle, categoryId]);

    return { isProduct, productData };
};