const buildProductQuery = (baseQuery, params, hasExistingWhere = false, existingPlaceholderCount = 0) => {
    const { search, category_id, sortBy, sortOrder, minPrice, maxPrice, limit, offset } = params;
    const values = [];
    let placeholderIndex = existingPlaceholderCount + 1; // Start after pre-existing placeholders if applicable
    let whereConditions = hasExistingWhere ? '' : 'WHERE 1=1'; // Avoid duplicate WHERE

    // Add search condition
    if (search && search.trim()) {
        whereConditions += ` AND (LOWER(p.name) LIKE $${placeholderIndex} OR LOWER(p.description) LIKE $${placeholderIndex + 1})`;
        values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
        placeholderIndex += 2;
    }

    // Add category filter
    if (category_id) {
        whereConditions += ` AND p.category_id = $${placeholderIndex}`;
        values.push(category_id);
        placeholderIndex++;
    }

    // Add price range filters
    if (minPrice) {
        whereConditions += ` AND p.price >= $${placeholderIndex}`;
        values.push(minPrice);
        placeholderIndex++;
    }

    if (maxPrice) {
        whereConditions += ` AND p.price <= $${placeholderIndex}`;
        values.push(maxPrice);
        placeholderIndex++;
    }

    const orderClause = sortBy
        ? ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`
        : ` ORDER BY p.created_at DESC`;

    const pagination = limit ? ` LIMIT $${placeholderIndex} OFFSET $${placeholderIndex + 1}` : '';
    if (limit) {
        values.push(limit, offset || 0);
    }

    const query = `
        ${baseQuery}
        ${whereConditions.trim()}
        ${orderClause}
        ${pagination}
    `.trim();

    return { query, values };
};

module.exports = {
    buildProductQuery,
};
