'use client';

export const testOrder = {
  id: "test-order-id-1234",
  created_at: "2025-05-17T12:00:00Z",
  order_ref: "MP-885033",
  total_amount: 1650.00,
  shipping_fee: 150.00,
  status: "pending_payment",
  customer_email: "bakielisrael@gmail.com",
  shipping_address: {
    firstName: "Zenzele",
    lastName: "Nxumalo",
    addressLine1: "41 Moffat Rd, Unit 4 Rus. Biejie",
    addressLine2: "",
    city: "Bela-Bela",
    province: "Limpopo",
    postalCode: "0480",
    country: "South Africa",
    phone: "0659387000"
  },
  order_items: [
    {
      id: "item-123",
      quantity: 1,
      price: 1500.00,
      products: {
        name: "Product not found",
        sku: "MP-G7-RD-01"
      },
      size: "36"
    }
  ]
};