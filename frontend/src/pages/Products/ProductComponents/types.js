/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} sku
 * @property {string} barcode
 * @property {string} category
 * @property {string} brand
 * @property {string} unit
 * @property {string=} description
 * @property {number} costPrice
 * @property {number} retailPrice
 * @property {number} wholesalePrice
 * @property {number} stock
 * @property {number=} minStock
 * @property {number=} maxStock
 * @property {number=} weight
 * @property {string=} dimensions
 * @property {number=} variants
 * @property {string=} image
 * @property {"active" | "inactive"} status
 * @property {string=} createdAt
 * @property {string=} updatedAt
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string=} id
 * @property {string} name
 * @property {string} sku
 * @property {string} barcode
 * @property {Object.<string, string>} attributes
 * @property {number} price
 * @property {number} stock
 * @property {"active" | "inactive"} status
 */

/**
 * @typedef {"list" | "add" | "detail" | "edit" | "add-variant" | "edit-variant"} ScreenType
 */
