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
    
    // Camera routes
    "/send/camera": {};
    "/send/qr-scanner": {};
    
    // Transaction route
    "/transaction/[id]": {
      id: string;
    };
  }
}

export {} 