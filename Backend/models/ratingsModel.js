const client = require('../db');

// Add a new rating
const addRating = async ({ product_id, user_id, rating, review }) => {
    const query = `
        INSERT INTO ratings (product_id, user_id, rating, review)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [product_id, user_id, rating, review];
    const result = await client.query(query, values);
    return result.rows[0];
};

// Fetch product ratings (average and count)
const fetchProductRatings = async (product_id) => {
    const query = `
        SELECT 
            AVG(rating) AS average_rating,
            COUNT(rating) AS rating_count
        FROM ratings
        WHERE product_id = $1;
    `;
    const result = await client.query(query, [product_id]);
    return result.rows[0];
};

// Fetch all ratings for a product
const fetchRatingsByProduct = async (product_id) => {
    const query = `
        SELECT 
            r.rating, 
            r.review, 
            r.created_at,
            u.full_name AS user_name
        FROM ratings r
        INNER JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC;
    `;
    const result = await client.query(query, [product_id]);
    return result.rows;
};

module.exports = {
    addRating,
    fetchProductRatings,
    fetchRatingsByProduct,
};
