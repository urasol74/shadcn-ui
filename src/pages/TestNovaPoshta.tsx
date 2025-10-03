// src/pages/TestNovaPoshta.tsx
import React, { useState } from 'react';
import { Toaster } from 'sonner';

// 1. Импортируем наш новый компонент
import NovaPoshta from '@/components/NovaPoshta';

// 2. Определяем интерфейс для хранения выбора (для удобства)
interface Selection {
  city: { value: string; label: string } | null;
  warehouse: { value: string; label: string } | null;
}

/**
 * Тестовая страница, демонстрирующая работу изолированного компонента NovaPoshta.
 */
const TestNovaPoshta: React.FC = () => {
  // 3. Создаем единственное, простое состояние для хранения результата
  const [novaPoshtaSelection, setNovaPoshtaSelection] = useState<Selection>({ 
    city: null, 
    warehouse: null 
  });

  // Вся сложная логика (запросы, состояния, эффекты) теперь удалена отсюда
  // и находится внутри компонента NovaPoshta.

  return (
    <div className="container mx-auto p-6">
      {/* Toaster нужен для уведомлений об ошибках, которые генерирует дочерний компонент */}
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4">Тест Nova Poshta API</h1>

      {/* 
        4. Вставляем компонент как единый блок. 
        Передаем ему функцию setNovaPoshtaSelection, чтобы он мог
        "сообщать" нам о своем внутреннем выборе.
      */}
      <NovaPoshta onSelectionChange={setNovaPoshtaSelection} />

      {/* 5. Отображаем результат, который мы получили от дочернего компонента */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <p><strong>Выбранный город:</strong> {novaPoshtaSelection.city?.label || 'Не выбран'}</p>
        <p><strong>Выбранное отделение:</strong> {novaPoshtaSelection.warehouse?.label || 'Не выбрано'}</p>
      </div>
    </div>
  );
};

export default TestNovaPoshta;
