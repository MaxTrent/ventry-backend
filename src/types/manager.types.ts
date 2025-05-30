export interface IManager {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'superadmin' | 'manager';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateManagerInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'manager';
  }

  export interface ManagerQuery {
    page: number;
    limit: number;
  }