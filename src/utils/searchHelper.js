import { PRODUCTS_DATA, PENDING_IMAGES } from '@/data/productsData';

/**
 * Searches the products catalog by name, category, active ingredient, crop, disease, and code.
 * Matches are case-insensitive and support both English and Urdu fields.
 * 
 * @param {string} query - The search string
 * @param {string} lang - Current app language ('en' | 'ur')
 * @returns {Array} - Array of matching product objects
 */
export function searchCatalog(query, lang = 'en') {
  if (!query || !query.trim()) return [];
  const searchLower = query.toLowerCase().trim();

  // Convert products object to array
  const products = Object.values(PRODUCTS_DATA);

  return products.filter(p => {
    // Exclude products without images
    if (PENDING_IMAGES.includes(p.slug || p.id)) return false;

    // 1. Name Check (English and Urdu)
    const nameEn = typeof p.name === 'object' ? (p.name.en || '') : (p.name || '');
    const nameUr = typeof p.name === 'object' ? (p.name.ur || '') : '';
    if (nameEn.toLowerCase().includes(searchLower) || nameUr.includes(searchLower)) return true;

    // 2. Category Check (Matches category slug or its display label)
    const categorySlug = p.category || '';
    if (categorySlug.toLowerCase().includes(searchLower)) return true;
    
    // 3. Active Ingredient Check (English and Urdu / genericName)
    const activeEn = typeof p.activeIngredient === 'object' ? (p.activeIngredient.en || '') : (p.activeIngredient || p.formulation || '');
    const activeUr = typeof p.activeIngredient === 'object' ? (p.activeIngredient.ur || '') : '';
    const genericEn = typeof p.genericName === 'object' ? (p.genericName.en || '') : (p.genericName || '');
    const genericUr = typeof p.genericName === 'object' ? (p.genericName.ur || '') : '';
    if (
      activeEn.toLowerCase().includes(searchLower) || 
      activeUr.includes(searchLower) ||
      genericEn.toLowerCase().includes(searchLower) ||
      genericUr.includes(searchLower)
    ) return true;

    // 4. Disease Check (from diseases field or description/tagline)
    const diseasesEn = typeof p.diseases === 'object' ? (p.diseases.en || '') : (p.diseases || '');
    const diseasesUr = typeof p.diseases === 'object' ? (p.diseases.ur || '') : '';
    const taglineEn = typeof p.tagline === 'object' ? (p.tagline.en || '') : (p.tagline || '');
    const taglineUr = typeof p.tagline === 'object' ? (p.tagline.ur || '') : '';
    const descEn = typeof p.description === 'object' ? (p.description.en || '') : (p.description || '');
    const descUr = typeof p.description === 'object' ? (p.description.ur || '') : '';
    const shortDescEn = typeof p.shortDesc === 'object' ? (p.shortDesc.en || '') : (p.shortDesc || '');
    const shortDescUr = typeof p.shortDesc === 'object' ? (p.shortDesc.ur || '') : '';

    if (
      diseasesEn.toLowerCase().includes(searchLower) || 
      diseasesUr.includes(searchLower) ||
      taglineEn.toLowerCase().includes(searchLower) ||
      taglineUr.includes(searchLower) ||
      descEn.toLowerCase().includes(searchLower) ||
      descUr.includes(searchLower) ||
      shortDescEn.toLowerCase().includes(searchLower) ||
      shortDescUr.includes(searchLower)
    ) return true;

    // 5. Crop Check (e.g. Cotton / کپاس)
    if (p.crops && Array.isArray(p.crops)) {
      const matchCrop = p.crops.some(c => {
        const cropEn = typeof c === 'object' ? (c.name?.en || c.name || '') : c;
        const cropUr = typeof c === 'object' ? (c.name?.ur || '') : '';
        return String(cropEn).toLowerCase().includes(searchLower) || String(cropUr).includes(searchLower);
      });
      if (matchCrop) return true;
    }

    // 6. Product Code / SKU Check
    const code = p.productCode || p.id || p.slug || '';
    if (code.toLowerCase().includes(searchLower)) return true;
    if (p.sizes && Array.isArray(p.sizes)) {
      const matchSku = p.sizes.some(s => s.sku?.toLowerCase().includes(searchLower));
      if (matchSku) return true;
    }

    return false;
  });
}
