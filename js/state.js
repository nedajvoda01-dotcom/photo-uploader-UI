// ======= STATE: single source of truth for active filters =======
let activeFilter = null;
let activeStatus = null;
let activeCondition = null;
let searchQuery = '';

/**
 * Returns a filtered subset of window.CARS_DATA based on the current state.
 */
const filterCars = () => {
  return window.CARS_DATA.filter(car => {
    if (activeFilter && car.filter !== activeFilter) return false;
    if (activeStatus && (car.status || 'actual') !== activeStatus) return false;
    if (activeCondition && car.condition !== activeCondition) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${car.vin} ${car.brand} ${car.model} ${car.year} ${car.color}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
    return true;
  });
};
