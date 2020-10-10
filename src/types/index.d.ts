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
