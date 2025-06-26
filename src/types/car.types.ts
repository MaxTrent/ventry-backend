export interface ICar {
    _id: string;
    brand: string;
    model: string;
    price: number;
    isAvailable: boolean;
    category: string;
    year: number;
    mileage: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    transmission: 'Automatic' | 'Manual';
    color: string;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateCarInput {
    brand: string;
    model: string;
    price: number;
    isAvailable?: boolean;
    category: string;
    year: number;
    mileage?: number;
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    transmission: 'Automatic' | 'Manual';
    color: string;
    photos?: string[];
  }
  
  export interface CarQuery {
    brand?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    category?: string;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    color?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }