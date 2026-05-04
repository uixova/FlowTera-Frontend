import { api } from '../../../api/api'; 

// Varsayılan sayfa boyutları
const ARCHIVE_PAGE_SIZE = 30; 

// mock modda client-side teamId filtresi
const filterByTeam = (items, teamId) => {
  if (!teamId) return items;
  return items.filter((item) => String(item.teamId) === String(teamId));
};

export const archiveService = {
  getArchiveData: async ({
    teamId,
    page        = 1,
    pageSize    = ARCHIVE_PAGE_SIZE,
    forceRefresh = false,
  } = {}) => {
    // forceRefresh istendiyse ilgili cache leri temizle
    if (forceRefresh) {
      api.cache.invalidate('ARCHIVE');
      api.cache.invalidate('TRIPS');
    }

    // Paralel istek — her biri kendi TTL cache ini kullanır
    const [expenseResult, tripResult] = await Promise.all([
      api.archive.getAll({ page, pageSize }, { forceRefresh }),
      api.trips.getAll(  { page, pageSize }, { forceRefresh }),
    ]);

    // Mock modda client-side filtre
    const expenses = {
      ...expenseResult,
      data: filterByTeam(expenseResult?.data ?? [], teamId),
    };

    const trips = {
      ...tripResult,
      data: filterByTeam(tripResult?.data ?? [], teamId),
    };

    return { expenses, trips };
  },

  // Sadece harcamaları getirir
  getExpenses: ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false } = {}) =>
    api.archive.getAll({ page, pageSize }, { forceRefresh }).then((result) => ({
      ...result,
      data: filterByTeam(result?.data ?? [], teamId),
    })),

  // Sadece seyahatleri getirir
  getTrips: ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false } = {}) =>
    api.trips.getAll({ page, pageSize }, { forceRefresh }).then((result) => ({
      ...result,
      data: filterByTeam(result?.data ?? [], teamId),
    })),

  // Cache'i temizler
  invalidate: () => {
    api.cache.invalidate('ARCHIVE');
    api.cache.invalidate('TRIPS');
  },
};