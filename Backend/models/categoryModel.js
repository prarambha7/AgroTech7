const client = require('../db');

const fetchCategoriesWithUOM = async () => {
  const query = `
    SELECT id, name, uom
    FROM categories
  `;
  const result = await client.query(query);
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    uoms: row.uom, // Assuming uom is stored as an array in the database
  }));
};

module.exports = {
  fetchCategoriesWithUOM,
};
