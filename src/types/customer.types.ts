export interface ICustomer {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'customer';
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SignupCustomerInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  
  export interface OtpInput {
    email: string;
    otp: string;
  }