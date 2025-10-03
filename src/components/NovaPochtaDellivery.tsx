import React, { useState, useEffect } from "react";

/**
 * Props для калькулятора доставки.
 * @param recipientCityRef - Ref города получателя.
 * @param assessedCost - Оценочная стоимость посылки (сумма заказа).
 */
interface DeliveryCalculatorProps {
  recipientCityRef: string | null;
  assessedCost: number;
}

const DeliveryCalculator: React.FC<DeliveryCalculatorProps> = ({ recipientCityRef, assessedCost }) => {
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const apiKey = "e7e59d1bc3dcb34b94529a24c2e00921";
  const SENDER_CITY_REF = "e71c2a15-4b33-11e4-ab6d-005056801329";

  useEffect(() => {
    // Расчет не будет производиться, если не выбран город или сумма заказа равна 0
    if (!recipientCityRef || assessedCost === 0) {
      setPrice(null);
      return;
    }

    const calculatePrice = async () => {
      setLoading(true);
      setPrice(null);
      try {
        const priceRes = await fetch("https://api.novaposhta.ua/v2.0/json/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            modelName: "InternetDocument",
            calledMethod: "getDocumentPrice",
            methodProperties: {
              CitySender: SENDER_CITY_REF,
              CityRecipient: recipientCityRef,
              Weight: "1",
              ServiceType: "WarehouseWarehouse",
              // Используем реальную сумму заказа как оценочную стоимость
              Cost: assessedCost.toString(),
            },
          }),
        });

        const priceData = await priceRes.json();
        if (priceData.success && priceData.data.length > 0) {
          setPrice(priceData.data[0].Cost + " грн");
        } else {
          setPrice("Ошибка расчета");
          console.error("Ошибка API Новой Почты:", priceData.errors);
        }
      } catch (err: any) {
        console.error("Ошибка сетевого запроса:", err);
        setPrice("Ошибка запроса");
      } finally {
        setLoading(false);
      }
    };

    calculatePrice();
    // Добавляем assessedCost в массив зависимостей, чтобы пересчитывать при изменении суммы
  }, [recipientCityRef, assessedCost]);

  return (
    <div>
      {loading && <p>Расчет стоимости доставки...</p>}
      {!loading && price && <p><strong>Примерная стоимость доставки:</strong> {price}</p>}
      {!recipientCityRef && <p className="text-sm text-gray-500">Выберите город, чтобы рассчитать стоимость доставки.</p>}
    </div>
  );
};

export default DeliveryCalculator;
