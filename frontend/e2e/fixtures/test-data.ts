export const TEST_USERS = {
  buyer: {
    email: 'buyer_e2e@test.com',
    password: 'Test1234!',
    firstName: 'Juan',
    lastName: 'Perez',
    documentNumber: '12345678',
    mobilePhone: '987654321',
    address: 'Av. Lima 123',
    postalCode: '15001',
  },
  seller: {
    email: 'seller_e2e@test.com',
    password: 'Test1234!',
  },
  admin: {
    email: 'admin_e2e@test.com',
    password: 'Admin1234!',
  },
};

/** UUID de un listing existente en la BD de pruebas (seed requerido) */
export const TEST_LISTING_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

export const API_BASE_URL = 'http://localhost:5021/api';
