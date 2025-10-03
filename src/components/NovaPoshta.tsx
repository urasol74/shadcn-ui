import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select, { OnChangeValue } from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';

const API_KEY = 'e7e59d1bc3dcb34b94529a24c2e00921'; // Ключ не менять на переменную в .env

interface SelectOption {
  value: string;
  label: string;
}

// Интерфейс для пропсов, которые будет принимать наш новый компонент
interface NovaPoshtaProps {
  /**
   * Необязательная функция обратного вызова.
   * Срабатывает каждый раз, когда меняется выбор города или отделения.
   */
  onSelectionChange?: (selection: {
    city: SelectOption | null;
    warehouse: SelectOption | null;
  }) => void;
}

// Асинхронная функция для поиска городов. Остается без изменений.
const fetchCities = async (searchText: string): Promise<SelectOption[]> => {
  if (searchText.length < 1) return [];
  try {
    const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: API_KEY,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: { FindByString: searchText, Limit: 50 },
      }),
    });
    const data = await response.json();
    return data.success ? data.data.map((city: any) => ({ value: city.Ref, label: city.Description })) : [];
  } catch (err) {
    console.error("City fetch error:", err);
    return [];
  }
};

/**
 * Изолированный компонент для выбора адреса доставки "Нова Пошта".
 * Включает в себя всю логику для поиска городов и загрузки отделений.
 */
const NovaPoshta: React.FC<NovaPoshtaProps> = ({ onSelectionChange }) => {
  // Вся внутренняя логика состояния перенесена из TestNovaPoshta.tsx
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<SelectOption | null>(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка городов с задержкой (debounce) для оптимизации запросов
  const loadOptions = useCallback((inputValue: string, callback: (options: SelectOption[]) => void) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(async () => {
      const options = await fetchCities(inputValue);
      callback(options);
    }, 400);
  }, []);

  // Этот хук следит за изменениями выбора и "сообщает" о них родительскому компоненту
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({ city: selectedCity, warehouse: selectedWarehouse });
    }
  }, [selectedCity, selectedWarehouse, onSelectionChange]);

  // Обработчик смены города
  const handleCityChange = (option: OnChangeValue<SelectOption, false>) => {
    setSelectedCity(option);
    // При смене города всегда сбрасываем выбранное отделение
    setSelectedWarehouse(null);
  };

  // Обработчик смены отделения
  const handleWarehouseChange = (option: OnChangeValue<SelectOption, false>) => {
    setSelectedWarehouse(option);
  };

  // Загрузка отделений при выборе города. Логика полностью сохранена.
  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([]);
      return;
    }

    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      try {
        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: API_KEY,
            modelName: 'AddressGeneral',
            calledMethod: 'getWarehouses',
            methodProperties: { CityRef: selectedCity.value },
          }),
        });
        const data = await response.json();
        if (data.success) {
          setWarehouses(data.data.map((w: any) => ({ value: w.Ref, label: w.Description })));
        } else {
          toast.error('Ошибка при загрузке отделений');
        }
      } catch (err) {
        toast.error('Сетевая ошибка при загрузке отделений');
      }
      setLoadingWarehouses(false);
    };

    fetchWarehouses();
  }, [selectedCity]);

  // JSX был очищен от всего лишнего (заголовков, оберток, тестовых блоков)
  return (
    <div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Выберите город:</label>
        <AsyncSelect
          value={selectedCity}
          cacheOptions
          loadOptions={loadOptions}
          placeholder="Начните вводить город..."
          onChange={handleCityChange}
          isClearable
          noOptionsMessage={() => 'Город не найден'}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Выберите отделение:</label>
        <Select
          value={selectedWarehouse}
          options={warehouses}
          isLoading={loadingWarehouses}
          isDisabled={!selectedCity || loadingWarehouses}
          placeholder="Выберите отделение..."
          onChange={handleWarehouseChange}
          isClearable
          noOptionsMessage={() => 'Отделения не найдены'}
        />
      </div>
    </div>
  );
};

export default NovaPoshta;
