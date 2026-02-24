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
    const kits = Array.isArray(car.kits) && car.kits.length ? car.kits : [{ photos: [], used: false }];
    const photos = kits[0] && Array.isArray(kits[0].photos) ? kits[0].photos : [];
    const totalCount = kits.length;
    const uploadedCount = Number.isFinite(car.photosCount) ? car.photosCount : kits.filter(k => Array.isArray(k.photos) && k.photos.length > 0).length;
    const usedCount = Number.isFinite(car.usedPhotosCount) ? car.usedPhotosCount : kits.filter(k => !!k.used).length;
    const usedPart = Math.min(uploadedCount, usedCount);
    const uploadedPart = Math.max(0, uploadedCount - usedPart);
    const usedPercent = totalCount > 0 ? Math.min(100, Math.max(0, (usedPart / totalCount) * 100)) : 0;
    const uploadedPercent = totalCount > 0 ? Math.min(100, Math.max(0, (uploadedPart / totalCount) * 100)) : 0;
    const titleLine = [
      toTitleCaseText(car.brand),
      toTitleCaseText(car.model),
      car.year ? String(car.year).trim() : ''
    ].filter(Boolean).join(' ');
    const colorLine = toTitleCaseText(car.color);

    // Для сетки: максимум 6 ячеек
    let photoGrid = '';
    for (let i = 0; i < 6; i++) {
      const hiddenPhotosCount = Math.max(0, photos.length - 6);
      if (photos.length > 6 && i === 5) {
        photoGrid += `<div class="photo-placeholder photo-placeholder--filled"><img class="photo-placeholder-img" src="${photos[i]}" alt="Фото авто"><div class="photo-placeholder-more">+${hiddenPhotosCount}</div></div>`;
      } else if (photos[i]) {
        photoGrid += `<div class="photo-placeholder photo-placeholder--filled"><img class="photo-placeholder-img" src="${photos[i]}" alt="Фото авто"></div>`;
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
            <span class="photo-count">${uploadedCount}/${totalCount}</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill progress-bar-fill--used" style="width: ${usedPercent}%"></div>
            <div class="progress-bar-fill progress-bar-fill--uploaded" style="left: ${usedPercent}%; width: ${uploadedPercent}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
};
