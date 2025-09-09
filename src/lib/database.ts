// Database interface for SQLite database
export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  article: string;
  name: string;
  category_id: number;
  brand: string;
  season: string;
  gender: string;
}

export interface Variant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  barcode: string;
  stock: number;
  purchase_price: number;
  sale_price: number;
  new_price: number;
  total_price: number;
  discount: number;
}

export interface ProductWithCategory extends Product {
  category_name: string;
}

export interface ProductWithVariants extends ProductWithCategory {
  variants: Variant[];
}

// Mock data for development - in production this would connect to the SQLite database
export const mockCategories: Category[] = [
  { id: 1, name: 'БРЮКИ' },
  { id: 2, name: 'СВЕТР' },
  { id: 3, name: 'ТОП' },
  { id: 4, name: 'ПЛАТЬЕ' },
  { id: 5, name: 'ЮБКА' },
  { id: 6, name: 'КУРТКА' },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    article: '4DHJUF05K',
    name: '4DHJUF05K БРЮКИ',
    category_id: 1,
    brand: 'BENETTON',
    season: '2025 весна-літо',
    gender: 'чол'
  },
  {
    id: 2,
    article: '4DMKPF12L',
    name: '4DMKPF12L СВЕТР',
    category_id: 2,
    brand: 'BENETTON',
    season: '2025 весна-літо',
    gender: 'жiн'
  },
  {
    id: 3,
    article: '4DTOPW18M',
    name: '4DTOPW18M ТОП',
    category_id: 3,
    brand: 'BENETTON',
    season: '2025 весна-літо',
    gender: 'жiн'
  },
];

export const mockVariants: Variant[] = [
  {
    id: 1,
    product_id: 1,
    size: '52',
    color: '901',
    barcode: '8055268502393',
    stock: 5,
    purchase_price: 800,
    sale_price: 1200,
    new_price: 1000,
    total_price: 1000,
    discount: 15
  },
  {
    id: 2,
    product_id: 1,
    size: '50',
    color: '901',
    barcode: '8055268502394',
    stock: 3,
    purchase_price: 800,
    sale_price: 1200,
    new_price: 1000,
    total_price: 1000,
    discount: 15
  },
];

// Database functions
export const getCategories = (): Category[] => {
  return mockCategories;
};

export const getProductsByGender = (gender: string): ProductWithCategory[] => {
  return mockProducts
    .filter(product => product.gender === gender)
    .map(product => ({
      ...product,
      category_name: mockCategories.find(cat => cat.id === product.category_id)?.name || ''
    }));
};

export const getProductsByCategory = (categoryId: number): ProductWithCategory[] => {
  return mockProducts
    .filter(product => product.category_id === categoryId)
    .map(product => ({
      ...product,
      category_name: mockCategories.find(cat => cat.id === product.category_id)?.name || ''
    }));
};

export const getProductById = (productId: number): ProductWithVariants | null => {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return null;
  
  const category = mockCategories.find(cat => cat.id === product.category_id);
  const variants = mockVariants.filter(v => v.product_id === productId);
  
  return {
    ...product,
    category_name: category?.name || '',
    variants
  };
};

export const getCategoriesByGender = (gender: string): Category[] => {
  const productCategories = mockProducts
    .filter(product => product.gender === gender)
    .map(product => product.category_id);
  
  const uniqueCategoryIds = [...new Set(productCategories)];
  
  return mockCategories.filter(category => 
    uniqueCategoryIds.includes(category.id)
  );
};