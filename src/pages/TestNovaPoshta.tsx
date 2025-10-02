// src/pages/TestNovaPoshta.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select, { OnChangeValue } from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast, Toaster } from 'sonner';

// ПОЛНОСТЬЮ УДАЛЕНЫ ВСЕ ВНЕШНИЕ ЗАВИСИМОСТИ И МОДУЛЬНЫЕ ПЕРЕМЕННЫЕ

const API_KEY = 'e7e59d1bc3dcb34b94529a24c2e00921';

interface SelectOption {
  value: string;
  label: string;
}

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
    // Не показываем ошибку в тосте, чтобы не мешать пользователю, если он быстро печатает
    console.error("City fetch error:", err);
    return [];
  }
};

const TestNovaPoshta: React.FC = () => {
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<SelectOption | null>(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // РЕАЛИЗАЦИЯ DEBOUNCE ВНУТРИ КОМПОНЕНТА С ПОМОЩЬЮ ХУКОВ
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadOptions = useCallback((inputValue: string, callback: (options: SelectOption[]) => void) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(async () => {
      const options = await fetchCities(inputValue);
      callback(options);
    }, 400);
  }, []);

  const handleCityChange = (option: OnChangeValue<SelectOption, false>) => {
    setSelectedCity(option);
  };

  const handleWarehouseChange = (option: OnChangeValue<SelectOption, false>) => {
    setSelectedWarehouse(option);
  };

  useEffect(() => {
    if (!selectedCity) {
      setWarehouses([]);
      setSelectedWarehouse(null);
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

  return (
    <div className="container mx-auto p-6">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4">Тест Nova Poshta API</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Выберите город:</label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          placeholder="Начните вводить город..."
          onChange={handleCityChange}
          isClearable
          noOptionsMessage={() => 'Город не найден'}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Выберите отделение:</label>
        <Select
          placeholder="Выберите отделение..."
          value={selectedWarehouse}
          options={warehouses}
          isLoading={loadingWarehouses}
          isDisabled={!selectedCity || loadingWarehouses}
          onChange={handleWarehouseChange}
          isClearable
          noOptionsMessage={() => 'Отделения не найдены'}
        />
      </div>

      <div className="mt-6 p-4 border rounded bg-gray-50">
        <p><strong>Выбранный город:</strong> {selectedCity?.label || 'Не выбран'}</p>
        <p><strong>Выбранное отделение:</strong> {selectedWarehouse?.label || 'Не выбрано'}</p>
      </div>
    </div>
  );
};

export default TestNovaPoshta;
