export const keywords: Record<string, string[]> = {
  water: ['water', 'pipe', 'leak', 'tank', 'well', 'tap', 'drainage', 'flood'],
  electricity: ['electricity', 'power', 'light', 'wire', 'pole', 'transformer', 'blackout', 'voltage'],
  infrastructure: ['road', 'bridge', 'pothole', 'street', 'construction', 'building', 'wall', 'path'],
  health: ['hospital', 'clinic', 'medicine', 'doctor', 'disease', 'sanitation', 'trash', 'waste'],
  agriculture: ['farm', 'crop', 'irrigation', 'soil', 'seed', 'fertilizer', 'cattle', 'livestock']
};

export function detectCategory(text: string): string | null {
  const normalizedText = text.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => normalizedText.includes(word))) {
      return category;
    }
  }
  
  return null;
}
