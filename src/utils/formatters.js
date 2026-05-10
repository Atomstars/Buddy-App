export const INR_CURRENCY = 'INR';
export const INR_LOCALE = 'en-IN';

export const SECTORS = [
  {
    id: 'groceries',
    label: 'Groceries',
    shortLabel: 'Groceries',
    color: '#16A34A',
  },
  {
    id: 'food',
    label: 'Food & Coffee',
    shortLabel: 'Food',
    color: '#EA580C',
  },
  {
    id: 'fun',
    label: 'Fun & Weekends',
    shortLabel: 'Fun',
    color: '#7C3AED',
  },
];

export const formatCurrency = (amount = 0, options = {}) => {
  const { compact = false, maximumFractionDigits = 0 } = options;

  return new Intl.NumberFormat(INR_LOCALE, {
    style: 'currency',
    currency: INR_CURRENCY,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatAmount = (amount = 0, maximumFractionDigits = 0) => {
  return new Intl.NumberFormat(INR_LOCALE, {
    maximumFractionDigits,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const parseCurrencyInput = (value) => {
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getPercentage = (value, total) => {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const getSector = (sectorId) => {
  return SECTORS.find((sector) => sector.id === sectorId) || SECTORS[0];
};

export const getSectorColor = (sectorId) => {
  return getSector(sectorId).color;
};

export const getSectorLabel = (sectorId) => {
  return getSector(sectorId).label;
};

export const getSectorShortLabel = (sectorId) => {
  return getSector(sectorId).shortLabel;
};
