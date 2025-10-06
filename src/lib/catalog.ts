import { get } from './api';
import { categories as localCategories } from '../data/categories';
import type { TopCategory, MidCategory, SmallCategory } from '../data/categories';

let cachedCategories: TopCategory[] | null = null;
let inFlight: Promise<TopCategory[]> | null = null;

type CategoryTreeDto = {
  id: number;
  name: string;
  parentId: number | null;
  depth: 1 | 2 | 3;
  children?: CategoryTreeDto[] | null; // depth 1 only
  items?: CategoryTreeDto[] | null;    // depth 2 only
};

function mapDtoToLocal(dto: CategoryTreeDto[]): TopCategory[] {
  // dto is a list of depth=1 nodes each with children (depth=2),
  // and those with items (depth=3). Map into TopCategory → MidCategory → SmallCategory.
  return dto
    .filter(d => d.depth === 1)
    .map<TopCategory>(top => ({
      id: top.id,
      name: top.name,
      children: (top.children || []).filter(Boolean).map((mid) => ({
        id: mid.id,
        name: mid.name,
        parentId: top.id,
        items: (mid.items || []).filter(Boolean).map((leaf) => ({
          id: leaf.id,
          name: leaf.name,
          parentId: mid.id,
        } as SmallCategory)),
      } as MidCategory)),
    }));
}

export async function getCategoryTree(): Promise<TopCategory[]> {
  // Return cached result immediately if available
  if (cachedCategories) return cachedCategories;
  // If a request is already in flight, wait for it
  if (inFlight) return inFlight;
  
  inFlight = (async () => {
    try {
      const res = await get<CategoryTreeDto[]>('/api/catalog/categories/tree', { auth: false });
      cachedCategories = Array.isArray(res) && res.length ? mapDtoToLocal(res) : localCategories;
    } catch (err) {
      console.warn('[catalog] Failed to fetch categories, using local fallback:', err);
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

