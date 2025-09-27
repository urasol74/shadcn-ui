
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { name: string; article: string; image: string } | null;
  selectedVariant: { color: string; size: string } | null;
}

const BOT_TOKEN = '7223314836:AAEUHr6yHUM-RnNn3tTN9PpuFeRc9I10VH0';
const CHAT_ID = '1023307031';

export function QuickOrderModal({ isOpen, onClose, product, selectedVariant }: QuickOrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) {
      toast.error('Пожалуйста, введите имя и телефон.');
      return;
    }
    if (!product || !selectedVariant) {
      toast.error('Информация о товаре не найдена.');
      return;
    }

    setIsSending(true);

    const message = `
*⚡️ Быстрый заказ!*

*Имя:* ${name}
*Телефон:* ${phone}

*Товар:*
Название: ${product.name}
Артикул: ${product.article}
Цвет: ${selectedVariant.color}
Размер: ${selectedVariant.size}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('Ваш заказ успешно отправлен! Мы скоро с вами свяжемся.');
        setName('');
        setPhone('');
        onClose();
      } else {
        throw new Error(result.description);
      }
    } catch (error) {
      console.error('Telegram API error:', error);
      toast.error('Не удалось отправить заказ. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSending(false);
    }
  };

  if (!product || !selectedVariant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Быстрый заказ</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src={`https://fquvncbvvkfukbwsjhns.supabase.co/storage/v1/object/public/image/img-site/${product.image}`}
              alt={product.name}
              className="w-20 h-20 object-contain rounded-md bg-gray-100"
            />
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-500">Артикул: {product.article}</p>
              <p className="text-sm text-gray-500">Цвет: {selectedVariant.color}, Размер: {selectedVariant.size}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 999-99-99" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSending}>
            {isSending ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
