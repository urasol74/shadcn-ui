import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
// Импортируем наши правильные типы
import type { Product, Variant, User } from '@/types/types';

interface QuickOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    selectedVariant: Variant | null;
    user: User | null; // Используем правильный тип User
}

export const QuickOrderModal = ({ isOpen, onClose, product, selectedVariant, user }: QuickOrderModalProps) => {
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Используем правильную структуру: user.user_metadata.phone
        if (isOpen && user?.user_metadata?.phone) {
            setPhone(user.user_metadata.phone);
        }
    }, [isOpen, user]);

    const handleSubmit = async () => {
        if (!product || !selectedVariant) {
            toast.error("Произошла ошибка, товар не найден.");
            return;
        }
        if (!phone.trim()) {
            toast.error("Пожалуйста, введите номер телефона.");
            return;
        }

        setIsSubmitting(true);
        try {
            const orderDetails = {
                product_name: product.name,
                product_article: product.article,
                variant_size: selectedVariant.size,
                variant_color: selectedVariant.color,
                price: selectedVariant.discount > 0 ? selectedVariant.sale_price : selectedVariant.purchase_price,
                customer_phone: phone,
                customer_email: user?.email || 'Не указан',
                status: 'Новый',
                user_id: user?.id
            };

            const { error } = await supabase.from('quick_orders').insert(orderDetails);

            if (error) throw error;

            toast.success("Заказ успешно оформлен!", { description: "Мы скоро свяжемся с вами для подтверждения." });
            onClose();
        } catch (error: any) {
            console.error("Ошибка быстрого заказа:", error);
            toast.error("Не удалось оформить заказ.", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Быстрый заказ</DialogTitle>
                    <DialogDescription>
                        Оставьте ваш номер телефона, и наш менеджер свяжется с вами для оформления заказа.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Телефон</Label>
                        <Input 
                            id="phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="col-span-3" 
                            placeholder="+7 (999) 999-99-99"
                        />
                    </div>
                    {product && selectedVariant && (
                        <div className="text-sm text-gray-600 px-4">
                           <p><strong>Товар:</strong> {product.name} ({product.article})</p>
                           <p><strong>Размер:</strong> {selectedVariant.size}</p>
                           <p><strong>Цвет:</strong> {selectedVariant.color}</p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Отправка...' : 'Заказать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
