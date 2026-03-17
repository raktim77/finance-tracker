export type CategoryType = "expense" | "income";

export interface Category {
  _id: string;
  name: string;
  icon: string;
  type: CategoryType;
  color: string; 
}

export interface CategoriesResponse {
  ok: boolean;
  categories: Category[];
}