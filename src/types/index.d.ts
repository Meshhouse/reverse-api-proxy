type Category = {
  id: number;
  parentId: number;
  slug: string;
  name: string;
}

type Comment = {
  username: string;
  avatar: string;
  message: string;
  date: number;
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
  tags?: string[];
  mature_content?: boolean;
  downloadLinks?: SFMLabLink[];
  comments?: Comment[];
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
  size?: string;
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

type SFMLabModelsCache = FastifyCacheObject & {
  item: SFMLabFetch
}

type SFMLabSingleModelCache = FastifyCacheObject & {
  item: SFMLabModel
}

type ModelHaven3DFetch = {
  models: ModelHaven3DModel[];
  categories: Category[];
  totalPages: number;
}

type ModelHaven3DQuery = {
  category?: string;
  search?: string;
  page?: number;
}

type ModelHaven3DParams = {
  c?: string;
  o: string;
  s?: string;
}

type ModelHaven3DModel = {
  id: string;
  name: string;
  image: string;
  extension: string | string[];
}

