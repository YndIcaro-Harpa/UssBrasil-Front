/**
 * Converte texto para slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifyCategory(name: string) {
  return name
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function unslugifyCategory(slug: string, allCategories: string[]) {
  const normalized = slug.replace(/-/g, '').toLowerCase()
  return allCategories.find(c => c.replace(/\s+/g,'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase() === normalized) || slug
}
