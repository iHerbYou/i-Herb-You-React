const SEARCH_HISTORY_KEY = 'ihy_search_history';
const MAX_HISTORY_ITEMS = 5;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as SearchHistoryItem[];
    // 타임스탬프 순으로 정렬 (최신순)
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.warn('Failed to load search history:', error);
    return [];
  }
}

export function addSearchHistory(query: string): void {
  if (!query.trim()) return;
  
  try {
    const currentHistory = getSearchHistory();
    
    // 중복 제거 (같은 검색어가 있으면 제거)
    const filteredHistory = currentHistory.filter(item => 
      item.query.toLowerCase() !== query.toLowerCase()
    );
    
    // 새 검색어 추가
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now()
    };
    
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
}

export function removeSearchHistory(query: string): void {
  try {
    const currentHistory = getSearchHistory();
    const filteredHistory = currentHistory.filter(item => 
      item.query.toLowerCase() !== query.toLowerCase()
    );
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.warn('Failed to remove search history:', error);
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
}
