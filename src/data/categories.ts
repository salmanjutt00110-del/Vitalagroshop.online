// src/data/categories.ts
export const CATEGORIES = [
  { id: 'all',             label: 'All Products',    count: 0, theme: '#5cb85c' },
  { id: 'seed-treatment',  label: 'Seed Treatment',  count: 3, theme: '#c49a00' },
  { id: 'fungicide',       label: 'Fungicide',       count: 14, theme: '#0d8a8a' },
  { id: 'herbicide',       label: 'Herbicide',       count: 11, theme: '#8a6500' },
  { id: 'insecticide',     label: 'Insecticide',     count: 37, theme: '#8a2a00' },
  { id: 'plant-nutrition', label: 'Plant Nutrition', count: 6,  theme: '#2a5a8a' },
] as const
