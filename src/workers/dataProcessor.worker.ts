// Web Worker для обработки тяжелых вычислений
self.onmessage = function(e) {
  const { data, operation } = e.data;
  
  let result;
  
  switch (operation) {
    case 'processProducts':
      // Обработка больших массивов продуктов
      result = data.map(item => {
        // Имитация тяжелой обработки
        return {
          ...item,
          processed: true,
          timestamp: Date.now()
        };
      });
      break;
      
    case 'filterProducts':
      // Фильтрация больших массивов
      result = data.filter(item => {
        // Имитация сложной фильтрации
        return item.name && item.name.length > 0;
      });
      break;
      
    default:
      result = data;
  }
  
  // Отправляем результат обратно в основной поток
  self.postMessage({ result, operation });
};

export {};