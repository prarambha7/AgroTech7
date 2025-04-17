const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const productController = require('../controllers/productController');
const upload = require('../middleware/multerConfig'); // Multer configuration for file handling
const {
  addProduct,
  updateProduct,
  deleteProduct,
  fetchAllProducts,
  fetchProductsBySeller,
  getProductAvailability,
  fetchProductById,
} = require('../controllers/productController');

// Allowed fields for validation
const allowedFields = [
  'name',
  'category_id',
  'price',
  'quantity',
  'description',
  'images',
  'uom',
  'minimum_order_quantity',
];

// Middleware for validating product fields
const validateProductFields = (req, res, next) => {
  // Check for extra fields
  const extraFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));
  if (extraFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Unexpected fields: ${extraFields.join(', ')}. Allowed fields are: ${allowedFields.join(', ')}`,
    });
  }

  // Perform validation using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  next();
};

// Route: Add a product with image upload
router.post(
  '/add',
  auth(['seller']), // Only sellers can add products
  upload.array('images', 5), // Accept up to 5 images
  [
    check('name', 'Product name is required').not().isEmpty(),
    check('category_id', 'Category ID is required').isInt({ min: 1 }),
    check('price', 'Price must be a valid number').isFloat({ gt: 0 }),
    check('quantity', 'Quantity must be a valid number').isInt({ min: 0 }),
    check('description', 'Description must be provided').not().isEmpty(),
    check('uom', 'Unit of Measurement is required').not().isEmpty(),
    check('minimum_order_quantity', 'Minimum Order Quantity must be a positive integer').isInt({ min: 1 }),
  ],
  validateProductFields, // Validate fields
  addProduct // Call the controller function
);

// Route: Update a product
router.put(
  '/update/:id',
  auth(['seller']), // Only sellers can update their products
  upload.array('images', 5), // Optional file upload during update
  [
    check('name').optional().not().isEmpty().withMessage('Product name cannot be empty'),
    check('category_id').optional().isInt({ min: 1 }).withMessage('Category ID must be a valid integer'),
    check('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a valid number greater than 0'),
    check('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a valid number'),
    check('id', 'Invalid Product ID').isInt({ min: 1 }),
    check('description').optional().not().isEmpty().withMessage('Description cannot be empty'),
    check('uom').optional().not().isEmpty().withMessage('Unit of Measurement cannot be empty'),
    check('minimum_order_quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Minimum Order Quantity must be a positive integer'),
  ],
  validateProductFields, // Validate fields
  updateProduct // Call the controller function
);

// Route: Delete a product
router.delete(
  '/delete/:id',
  auth(['seller']), // Only sellers can delete their products
  async (req, res, next) => {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    next();
  },
  deleteProduct // Call the controller function
);

// Route: Fetch all products (accessible to buyers only)
router.get('/', auth(['user']), fetchAllProducts);

// Route: Fetch products by the seller (accessible to sellers only)
router.get('/my-products', auth(['seller']), fetchProductsBySeller);
// Route to fetch top-selling products
router.get('/top-selling', auth(['user']), productController.fetchTopSellingProducts);
// Route: Check product availability
router.get('/availability/:id', getProductAvailability);

// Route: Fetch a single product by ID (accessible to both buyers and sellers)
router.get('/:id', auth(['user', 'seller']), fetchProductById);

module.exports = router;
