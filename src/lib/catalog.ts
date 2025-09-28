import { get } from './api';
import { categories as localCategories } from '../data/categories';
import type { TopCategory } from '../data/categories';

let cachedCategories: TopCategory[] | null = null;
let inFlight: Promise<TopCategory[]> | null = null;

export async function getCategoryTree(): Promise<TopCategory[]> {
  if (cachedCategories) return cachedCategories;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await get<TopCategory[]>('/api/catalog/categories/tree');
      cachedCategories = Array.isArray(res) && res.length ? res : localCategories;
    } catch {
      cachedCategories = localCategories;
    } finally {
      inFlight = null;
    }
    return cachedCategories!;
  })();
  return inFlight;
}

export function getCategoryTreeSync(): TopCategory[] {
  return cachedCategories || localCategories;
}

