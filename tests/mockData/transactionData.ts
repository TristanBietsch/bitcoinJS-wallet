export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  fee?: number;
  timestamp: number; // Unix timestamp
  address: string;
  status: 'confirmed' | 'pending' | 'failed';
  hash?: string;
}

export const mockTransactions: Transaction[] = [
  // Today's transactions
  {
    id        : '1',
    type      : 'receive',
    amount    : 25.00,
    timestamp : Date.now() - 3600000, // 1 hour ago
    address   : 'bc1q7z5qm4ufhwu7gvgmp96hpr3hjzp3uy9cmsc3u6',
    status    : 'confirmed',
    hash      : '63b21a5e8c0a8e214b5e4c089dbe6940d14d2c1f1ca544db42a79e5db131bdc2'
  },
  {
    id        : '2',
    type      : 'send',
    amount    : 15.75,
    fee       : 0.25,
    timestamp : Date.now() - 7200000, // 2 hours ago
    address   : 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    status    : 'confirmed',
    hash      : 'b7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '3',
    type      : 'receive',
    amount    : 10.50,
    timestamp : Date.now() - 10800000, // 3 hours ago
    address   : 'bc1q6rcp080r9e26kz7k348fkqdrl88qk0rukwv7ht',
    status    : 'confirmed',
    hash      : 'f3d5a7b8c9e10a11b12c13d14e15f16g17h18i19j20k21l22m23n24o25p26q'
  },
  {
    id        : '4',
    type      : 'send',
    amount    : 5.25,
    fee       : 0.15,
    timestamp : Date.now() - 14400000, // 4 hours ago
    address   : 'bc1q7ctn67xnnzuthsv2j09lxu2wjrhuyw87djecnv',
    status    : 'confirmed',
    hash      : 'a1b2c3d4e5f6g7h8i9j10k11l12m13n14o15p16q17r18s19t20u21v22w23x'
  },
  {
    id        : '5',
    type      : 'receive',
    amount    : 75.00,
    timestamp : Date.now() - 18000000, // 5 hours ago
    address   : 'bc1qnc4930e9tujnm5lxjyfa7lzmasakastvxnghxp',
    status    : 'confirmed',
    hash      : 'z1y2x3w4v5u6t7s8r9q10p11o12n13m14l15k16j17i18h19g20f21e22d23c'
  },
  {
    id        : '6',
    type      : 'send',
    amount    : 30.00,
    fee       : 0.20,
    timestamp : Date.now() - 21600000, // 6 hours ago
    address   : 'bc1q39nrwj565hx5c9v4zpwhggdaz0j7tnl7qrk0th',
    status    : 'confirmed',
    hash      : 'q1w2e3r4t5y6u7i8o9p10a11s12d13f14g15h16j17k18l19z20x21c22v23b'
  },
  
  // Past week transactions
  {
    id        : '7',
    type      : 'receive',
    amount    : 42.50,
    timestamp : Date.now() - 3 * 24 * 3600000, // 3 days ago
    address   : 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej',
    status    : 'confirmed',
    hash      : '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  },
  {
    id        : '8',
    type      : 'send',
    amount    : 10.00,
    fee       : 0.15,
    timestamp : Date.now() - 4 * 24 * 3600000, // 4 days ago
    address   : 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
    status    : 'confirmed',
    hash      : 'a7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '9',
    type      : 'receive',
    amount    : 25.00,
    timestamp : Date.now() - 6 * 24 * 3600000, // 6 days ago
    address   : 'bc1qlz79r0p4sfqzmpqgcvj3c8e9tdehxaj3mj3dj6',
    status    : 'confirmed',
    hash      : 'b7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '10',
    type      : 'send',
    amount    : 50.75,
    fee       : 0.30,
    timestamp : Date.now() - 2 * 24 * 3600000, // 2 days ago
    address   : 'bc1qj7vl0gyzetjzky82qttnj3xkrmkxyhh8re0ghr',
    status    : 'confirmed',
    hash      : 'c9d8e7f6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0q9r8s7t6u5v4w3x2y1z'
  },
  {
    id        : '11',
    type      : 'receive',
    amount    : 15.25,
    timestamp : Date.now() - 5 * 24 * 3600000, // 5 days ago
    address   : 'bc1q82zj074qat5kauy2kgqvkm8zpjpeauxdcpzr8g',
    status    : 'confirmed',
    hash      : 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3h2g1f0e9d8c7b6a5'
  },
  {
    id        : '12',
    type      : 'send',
    amount    : 8.80,
    fee       : 0.10,
    timestamp : Date.now() - 3.5 * 24 * 3600000, // 3.5 days ago
    address   : 'bc1qkvww6hvr4le3eapk3thvr6jxk0x0nf5jxdlryd',
    status    : 'confirmed',
    hash      : 'a1s2d3f4g5h6j7k8l9z0x9c8v7b6n5m4'
  },

  // Last month transactions - Jan 2024
  {
    id        : '13',
    type      : 'send',
    amount    : 125.00,
    fee       : 0.35,
    timestamp : Date.now() - 15 * 24 * 3600000, // 15 days ago
    address   : 'bc1qa7zt97y5w7pt5vcm94gl38y5zcvun4mxpydkd8',
    status    : 'confirmed',
    hash      : 'c7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '14',
    type      : 'receive',
    amount    : 75.00,
    timestamp : Date.now() - 22 * 24 * 3600000, // 22 days ago
    address   : 'bc1qe767dfz3zty8anun3vfusd3h5tj3gqgzd5798r',
    status    : 'confirmed',
    hash      : 'd7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '15',
    type      : 'send',
    amount    : 25.00,
    fee       : 0.20,
    timestamp : Date.now() - 27 * 24 * 3600000, // 27 days ago
    address   : 'bc1qu5j7054hsmlnyv9we0wlcpxzhc65acpz062z2j',
    status    : 'confirmed',
    hash      : 'e7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
  },
  {
    id        : '16',
    type      : 'receive',
    amount    : 120.50,
    timestamp : Date.now() - 20 * 24 * 3600000, // 20 days ago
    address   : 'bc1qr9y8d76ur2k5tgx0hjnm8pt58ht6jg0zgew6nd',
    status    : 'confirmed',
    hash      : 'f1g2h3j4k5l6z7x8c9v0b1n2m3a4s5d6f7g8h9j0k1l2'
  },
  {
    id        : '17',
    type      : 'send',
    amount    : 65.25,
    fee       : 0.25,
    timestamp : Date.now() - 18 * 24 * 3600000, // 18 days ago
    address   : 'bc1q7ukgak9jduv80c63mtpxkzyd5h4syhc9ardgz5',
    status    : 'confirmed',
    hash      : 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3'
  },
  {
    id        : '18',
    type      : 'receive',
    amount    : 35.75,
    timestamp : Date.now() - 25 * 24 * 3600000, // 25 days ago
    address   : 'bc1qvshj78kqys0zf4x4sa3qgz2jgmmswsp2m4kvl6',
    status    : 'confirmed',
    hash      : 'z1x2c3v4b5n6m7a8s9d0f1g2h3j4k5l6'
  },

  // Two months ago - Dec 2023
  {
    id        : '19',
    type      : 'send',
    amount    : 150.00,
    fee       : 0.40,
    timestamp : Date.now() - 45 * 24 * 3600000, // 45 days ago
    address   : 'bc1qhptw4r5ne8txnlnj7dqhz4gwjrjhcmrz2j8s7z',
    status    : 'confirmed',
    hash      : 'a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0'
  },
  {
    id        : '20',
    type      : 'receive',
    amount    : 200.00,
    timestamp : Date.now() - 55 * 24 * 3600000, // 55 days ago
    address   : 'bc1q4wz9m0y7r6nkshvufx4ebhgel8c9n9nykuzmr3',
    status    : 'confirmed',
    hash      : 'q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4'
  },
  {
    id        : '21',
    type      : 'send',
    amount    : 45.50,
    fee       : 0.30,
    timestamp : Date.now() - 50 * 24 * 3600000, // 50 days ago
    address   : 'bc1qf0nm9k6zr7y6g5hx4l0aqpj2utw2j3tvyj5rhm',
    status    : 'confirmed',
    hash      : 'z9x8c7v6b5n4m3l2k1j0h9g8f7d6s5a4'
  },
  
  // Three months ago - Nov 2023
  {
    id        : '22',
    type      : 'receive',
    amount    : 85.25,
    timestamp : Date.now() - 75 * 24 * 3600000, // 75 days ago
    address   : 'bc1qg839a76fm3j5qepz89x4d7gr0t38c9qyqhc6jp',
    status    : 'confirmed',
    hash      : 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
  },
  {
    id        : '23',
    type      : 'send',
    amount    : 95.00,
    fee       : 0.35,
    timestamp : Date.now() - 85 * 24 * 3600000, // 85 days ago
    address   : 'bc1qnpq5l7k6y9r3zj04ehwj0vw8t35nsxm7gvqj6s',
    status    : 'confirmed',
    hash      : 'q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6'
  },
  {
    id        : '24',
    type      : 'receive',
    amount    : 120.75,
    timestamp : Date.now() - 90 * 24 * 3600000, // 90 days ago
    address   : 'bc1q0v8n7m6k5j4h3g2f1d0s9a8l7k6j5h4g3f2d1',
    status    : 'confirmed',
    hash      : 'z1x2c3v4b5n6m7a8s9d0f1g2h3j4k5l6'
  }
]

// Mock data for transaction fees
export const transactionFees = {
  // Standard fee tiers
  tiers : {
    economy : {
      sats                      : 3000,
      usd                       : 2.13,
      feeRate                   : 3,
      estimatedConfirmationTime : 120 // in minutes
    },
    standard : {
      sats                      : 5000,
      usd                       : 3.55,
      feeRate                   : 5,
      estimatedConfirmationTime : 60 // in minutes
    },
    express : {
      sats                      : 8000,
      usd                       : 5.68,
      feeRate                   : 8,
      estimatedConfirmationTime : 20 // in minutes
    }
  },
  
  // Fee rate conversion factors
  conversion : {
    // Simplified conversion rates for calculations
    satToDollar     : 0.00071, // 1 sat = $0.00071 USD
    vbyteMultiplier : 400, // Simplified factor to convert sat/vbyte to total sats for avg tx
    timeMultiplier  : 0.25 // Factor for time to fee rate conversion
  },

  // Calculate fee based on rate (sat/vbyte)
  calculateFeeFromRate : (rate: number) => {
    return Math.round(rate * 400) // Simple calculation assuming 400 vbytes per tx
  },

  // Estimate confirmation time from fee rate
  estimateConfirmationTime : (feeRate: number) => {
    // Higher fee rate = faster confirmation (simplified model)
    return Math.max(10, Math.round(200 / feeRate))
  },
  
  // Calculate fee rate from confirmation time
  calculateRateFromTime : (minutes: number) => {
    // Simple inverse relationship (faster = higher rate)
    return Math.max(1, Math.round(200 / minutes))
  }
}
