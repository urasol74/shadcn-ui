/**
 * Парсинг цены из формата базы данных
 * База может отдавать строку "2,109" где запятая - разделитель тысяч
 */
export const parseDbPrice = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    
    // Handle database format where comma is thousands separator (e.g., "2,109")
    let priceStr = String(value).replace(/\s+/g, '');
    
    // If string contains comma, treat it as thousands separator
    if (priceStr.includes(',')) {
        // Remove comma and parse as integer (2,109 -> 2109)
        priceStr = priceStr.replace(/,/g, '');
    }
    
    const n = Number(priceStr);
    return Number.isNaN(n) ? 0 : n;
};

/**
 * Форматирование цены для отображения
 */
export const formatPrice = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    
    const n = parseDbPrice(value);
    if (n === 0) return '-';
    
    // Manual formatting to ensure correct display
    // Format with space as thousands separator and always show ,0
    let formatted = n.toString();
    
    // Add space thousands separator for numbers >= 1000
    if (n >= 1000) {
        formatted = n.toLocaleString('ru-RU');
    }
    
    // Always add ,0 at the end
    formatted += ',0';
    
    return formatted + ' грн';
};

/**
 * Форматирование скидки
 */
export const formatDiscount = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(String(value).replace(',', '.'));
    if (Number.isNaN(n)) return String(value);
    return `${n}%`;
};