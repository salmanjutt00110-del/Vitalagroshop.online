/**
 * @typedef {'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled'} OrderStatus
 */

/**
 * @typedef {object} OrderItem
 * @property {string} productId
 * @property {string} productName
 * @property {string} category
 * @property {string} packSize
 * @property {number} quantity
 * @property {number} pricePerUnit
 * @property {number} totalPrice
 * @property {string} [productImage]
 */

/**
 * @typedef {object} CustomerInfo
 * @property {string} name
 * @property {string} phone
 * @property {string} city
 * @property {string} address
 */

/**
 * @typedef {object} Order
 * @property {string} [id]
 * @property {string} orderNumber
 * @property {OrderStatus} status
 * @property {OrderItem} item
 * @property {CustomerInfo} customer
 * @property {number} totalAmount
 * @property {'COD'} paymentMethod
 * @property {'website'} source
 * @property {boolean} whatsappSent
 * @property {any} createdAt
 * @property {any} updatedAt
 * @property {string} [notes]
 * @property {any} [confirmedAt]
 * @property {any} [deliveredAt]
 */

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};
