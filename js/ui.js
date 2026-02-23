// ======= UI: card rendering =======
const carsGrid = document.getElementById('carsGrid');

const getRandomLinks = () => {
  const links = [];
  if (Math.random() < 0.33) links.push('Видео');
  if (Math.random() < 0.33) links.push('Автотека');
  return links;
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
    const linksHtml = car.links.length > 0
      ? `<div class="links-items">${car.links.map(link => `<span class="link-item">${link}</span>`).join('')}</div>`
      : '';

    const priceFormatted = car.price ? car.price.toLocaleString('ru-RU') + ' ₽' : '';
    const engineInfo = [car.engineVolume, car.horsepower ? car.horsepower + ' л.с.' : '', car.drive, car.gearbox].filter(Boolean).join(' · ');

    return `
      <div class="car-card" data-role="car-card" data-vin="${car.vin}">
        <div class="car-vin"><span class="car-vin-prefix">VIN:</span> ${car.vin}</div>
        <div class="car-info-text">${car.brand} ${car.model}${car.trim ? ', ' + car.trim : ''}, ${car.color}, ${car.year}</div>
        ${engineInfo ? `<div class="car-info-text">${engineInfo}</div>` : ''}
        ${car.interiorType ? `<div class="car-info-text">${car.interiorType}</div>` : ''}
        ${priceFormatted ? `<div class="car-price">${priceFormatted}</div>` : ''}
        <div class="links-row">
          <span class="links-label">Ссылки:</span>
          ${linksHtml}
        </div>
        <div class="photo-placeholders">
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
          <div class="photo-placeholder"></div>
        </div>
        <div class="photo-progress">
          <div class="progress-header">
            <span>Загружено комплектов фото</span>
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
