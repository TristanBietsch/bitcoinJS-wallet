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
    "/send/loading": {};
    "/send/success": {
      transactionId: string;
    };
    
    // Camera routes
    "/send/camera": {};
    "/send/qr-scanner": {};
    
    // Transaction route
    "/transaction/[id]": {
      id: string;
    };
    
    // Wallet routes
    "/wallet/success": {
      transactionId: string;
    };
  }
}

export {} 