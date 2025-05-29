export interface ICategory {
    _id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateCategoryInput {
    name: string;
    description?: string;
  }
  
  export interface UpdateCategoryInput {
    name?: string;
    description?: string;
  }
  
  export interface CategoryQuery {
    name?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }