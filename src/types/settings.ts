export interface Category {
  id: string;
  name_translations: { [key: string]: string };
  slug_translations: { [key: string]: string };
  parent_id: string | null;
  attribute_template: any;
  children?: Category[];
}

export interface ConfigItem {
  id: string;
  key: string;
  value: any;
  description_translations: { [key: string]: string } | null;
}

export type CreateCategoryInput = Omit<Category, "id" | "children">;
export type CreateConfigInput = Omit<ConfigItem, "id">;
