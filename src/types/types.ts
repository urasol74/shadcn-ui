export interface Variant {
    id: number;
    size: string;
    purchase_price: number;
    sale_price: number;
    discount: number;
    stock: number;
    color: string;
}

export interface Product {
    id: number;
    article: string;
    name: string;
    gender: string;
    season: string;
    category_id: number;
    image: string;
    categories: { name: string };
    variants: Variant[];
}

export interface CartItem {
    id: number; // variant ID
    productId: number;
    name: string;
    article: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    stock: number;
}

// ИСПРАВЛЕННЫЙ ТИП USER
export interface User {
  id: string;
  email?: string;
  // Это правильная структура для пользовательских данных из Supabase
  user_metadata: {
    sale?: number;
    [key: string]: any; // Разрешаем другие поля в метаданных
  };
  // Добавьте другие стандартные поля объекта User из Supabase, если они понадобятся
}

