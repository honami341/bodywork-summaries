import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkshopEntry = CollectionEntry<'workshops'>;
export type AdviceEntry = CollectionEntry<'advice'>;

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

const byNewest = <T extends { data: { date: Date } }>(entries: T[]) =>
  entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export async function getPublishedWorkshops() {
  const entries = await getCollection('workshops', ({ data }) => data.status === 'published');
  return byNewest(entries);
}

export async function getPublishedAdvice() {
  const entries = await getCollection('advice', ({ data }) => data.status === 'published');
  return byNewest(entries);
}
