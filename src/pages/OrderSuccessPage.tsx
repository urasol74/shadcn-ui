import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12 text-center">
                <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Спасибо за ваш заказ!</h1>
                <p className="mt-2 text-base text-gray-500">Ваш заказ был успешно оформлен. Мы свяжемся с вами в ближайшее время.</p>
                <Link to="/">
                    <Button className="mt-6">Вернуться к покупкам</Button>
                </Link>
            </div>
        </div>
    );
}
