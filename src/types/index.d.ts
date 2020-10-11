type Category = {
  id: number;
  parentId: number;
  slug: string;
  name: string;
}

type SFMLabModel = {
  id: number;
  name: string
  image?: string;
  extension: string;
  category: string;
  description?: string;
  images?: string[];
  size?: string;
  downloadLinks?: SFMLabLink[];
}

type SFMLabLicense = {
  id: number | string;
  name: string;
}

type SFMLabFetch = {
  models: SFMLabModel[];
  categories: Category[];
  licenses: SFMLabLicense[];
  totalPages: number;
}

type SFMLabLink = {
  link: string;
  filename: string;
}

type SFMLabParams = {
  category?: number;
  order_by?: string;
  license?: number;
  search_text?: string;
  page?: number;
}

type SFMLabQuery = {
  category?: number;
  order?: string;
  license?: number;
  search?: string;
  page?: number;
}

type SFMLabQuerySingle = {
  id?: number
}

type FastifyCacheObject = {
  item: unknown;
  stored: number;
  ttl: number;
}

type SFMLabSingleModelCache = FastifyCacheObject & {
  item: SFMLabModel
}
