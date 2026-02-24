// ======= UI: card rendering =======
const carsGrid = document.getElementById('carsGrid');

const toTitleCaseText = (value) => {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((word) => word
      .split('-')
      .map((part) => {
        if (!part) return part;
        const lower = part.toLocaleLowerCase('ru-RU');
        return lower.charAt(0).toLocaleUpperCase('ru-RU') + lower.slice(1);
      })
      .join('-'))
    .join(' ');
};

const renderCars = () => {
  if (!window.CARS_DATA || !Array.isArray(window.CARS_DATA)) {
    carsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-500);">Ошибка: данные об автомобилях не загружены. Проверьте файл данных.</div>';
    return;
  }

  const filteredCars = filterCars();

  if (filteredCars.length === 0) {
    carsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-500);">Нет автомобилей</div>';
    return;
  }

  carsGrid.innerHTML = filteredCars.map(car => {
    const progressPercent = (car.photosCount / car.totalPhotos) * 100;
    const titleLine = [
      toTitleCaseText(car.brand),
      toTitleCaseText(car.model),
      car.year ? String(car.year).trim() : ''
    ].filter(Boolean).join(' ');
    const colorLine = toTitleCaseText(car.color);

    // Получить массив фото (base64 или url)
    const photos = Array.isArray(car.photosData) ? car.photosData : [];
    // Для сетки: максимум 6 ячеек, первая — фото, остальные — плейсхолдеры
    let photoGrid = '';
    for (let i = 0; i < 6; i++) {
      if (i === 0 && photos.length > 0 && photos[0]) {
        // Показываем превью первого фото
        photoGrid += `<div class="photo-placeholder"><img src="${photos[0]}" alt="Фото авто" style="width:100%;height:100%;object-fit:cover;border-radius:0;"></div>`;
      } else {
        photoGrid += '<div class="photo-placeholder"></div>';
      }
    }

    return `
      <div class="car-card" data-role="car-card" data-vin="${car.vin}">
        <div class="car-vin">VIN:${car.vin}</div>
        <div class="car-meta-lines">
          <div class="car-info-text" title="${titleLine}">${titleLine}</div>
          <div class="car-info-text" title="${colorLine}">${colorLine}</div>
        </div>
        <div class="photo-placeholders">
          ${photoGrid}
        </div>
        <div class="photo-progress">
          <div class="progress-header">
            <span>Загружено</span>
            <span class="photo-count">${car.photosCount}/${car.totalPhotos}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
};
