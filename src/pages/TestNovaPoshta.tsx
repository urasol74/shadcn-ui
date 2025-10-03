// src/pages/TestNovaPoshta.tsx
import React, { useState } from 'react';
import { Toaster } from 'sonner';

import NovaPoshta from '@/components/NovaPoshta';
import DeliveryCalculator from '@/components/NovaPochtaDellivery';

interface Selection {
  city: { value: string; label: string } | null;
  warehouse: { value: string; label: string } | null;
}

/**
 * Тестовая страница, демонстрирующая СВЯЗАННУЮ работу компонентов, 
 * включая передачу оценочной стоимости.
 */
const TestNovaPoshta: React.FC = () => {
  const [novaPoshtaSelection, setNovaPoshtaSelection] = useState<Selection>({ 
    city: null, 
    warehouse: null 
  });

  // Задаем фиксированную оценочную стоимость для теста
  const MOCK_ASSESSED_COST = 1500;

  return (
    <div className="container mx-auto p-6">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4">Тест API Новой Почты</h1>

      <div className="space-y-8">
        {/* --- Блок выбора адреса --- */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Компонент выбора адреса</h2>
          <NovaPoshta onSelectionChange={setNovaPoshtaSelection} />
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <p><strong>Выбранный город:</strong> {novaPoshtaSelection.city?.label || 'Не выбран'}</p>
            <p><strong>Выбранное отделение:</strong> {novaPoshtaSelection.warehouse?.label || 'Не выбрано'}</p>
          </div>
        </div>

        <hr className="my-8" />

        {/* --- Блок калькулятора доставки --- */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Калькулятор доставки (Одесса → Ваш город)</h2>
           <p className="text-sm text-gray-600 mb-2">Оценочная стоимость для расчета: {MOCK_ASSESSED_COST} грн</p>
          <div className="p-4 border rounded bg-gray-50 min-h-[70px]">
            {/* 
              Передаем Ref города и фиксированную оценочную стоимость в калькулятор.
            */}
            <DeliveryCalculator 
              recipientCityRef={novaPoshtaSelection.city?.value || null} 
              assessedCost={MOCK_ASSESSED_COST}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNovaPoshta;
