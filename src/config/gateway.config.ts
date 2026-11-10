export const serviceConfig = {
  users: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:300',
    timeout: 10000,
  },
  products: {
    url: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:300',
    timeout: 10000,
  },
  checkout: {
    url: process.env.CHECKOUT_SERVICE_URL || 'http://localhost:300',
    timeout: 10000,
  },
  payment: {
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:300',
    timeout: 10000,
  },
} as const;
