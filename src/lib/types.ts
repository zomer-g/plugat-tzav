export interface UpdateMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  tags?: string[];
}

export interface Update extends UpdateMeta {
  htmlContent: string;
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  image?: string;
}
