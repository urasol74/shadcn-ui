import { useEffect, useState } from 'react';
import { supabaseApi } from '@/lib/supabase-api';

export const useIsProduct = (decodedSeason: string | null, categoryId: string | undefined, seasons: string[]) => {
    const [isProduct, setIsProduct] = useState<boolean | null>(null);
    const [productData, setProductData] = useState<any>(null);

    useEffect(() => {
        // Если у нас есть categoryId, это точно не товар
        if (categoryId) {
            setIsProduct(false);
            return;
        }
        
        // Если season равен "all", это точно не товар
        if (decodedSeason === 'all') {
            setIsProduct(false);
            return;
        }
        
        // Если season совпадает с одним из известных сезонов, это точно сезон
        if (decodedSeason && seasons.includes(decodedSeason)) {
            setIsProduct(false);
            return;
        }
        
        // Если season не совпадает с известными сезонами, проверяем, является ли он артикулом товара
        if (decodedSeason) {
            const checkIfProductExists = async () => {
                try {
                    console.log('Проверка, является ли параметр товаром:', decodedSeason);
                    const productData = await supabaseApi.getProduct(decodedSeason);
                    
                    if (productData && productData.product) {
                        console.log('Найден товар:', productData.product);
                        setIsProduct(true);
                        setProductData(productData);
                    } else {
                        console.log('Товар не найден, считаем параметр сезоном');
                        setIsProduct(false);
                    }
                } catch (error) {
                    console.error('Ошибка при проверке товара:', error);
                    // Если ошибка, считаем, что это сезон
                    setIsProduct(false);
                }
            };
            
            checkIfProductExists();
        } else {
            // Если нет decodedSeason, это не товар
            setIsProduct(false);
        }
    }, [decodedSeason, categoryId, seasons]);

    return { isProduct, productData };
};