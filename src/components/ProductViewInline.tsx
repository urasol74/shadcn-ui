import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProductViewInlineProps {
    productData: any;
    gender: string | undefined;
}

export const ProductViewInline = ({ productData, gender }: ProductViewInlineProps) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-4 flex items-center gap-3">
                    <Button onClick={() => navigate(-1)} variant="ghost">← Назад</Button>
                    <Link to="/"><Button variant="outline">Домой</Button></Link>
                </div>
                <div className="text-center">
                    <h1>Страница товара</h1>
                    <p>Артикул: {productData.product?.article}</p>
                    <p>Название: {productData.product?.name}</p>
                    {/* Здесь должна быть полная реализация страницы товара */}
                </div>
            </div>
        </div>
    );
};