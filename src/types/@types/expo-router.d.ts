declare module "expo-router" {
  export interface RouteNames {
    // Receive routes
    "/receive/invoice": {
      amount: string;
      currency: string;
    };
    
    // Send routes
    "/send/amount": {
      address: string;
      speed: string;
    };
    
    // Transaction route
    "/transaction/[id]": {
      id: string;
    };
  }
}

export {} 