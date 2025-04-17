const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImagesToCloudinary = async (files, folder = 'products') => {
  try {
    const uploadPromises = files.map(file =>
      cloudinary.uploader.upload(file.path, { folder })
    );
    const uploadedImages = await Promise.all(uploadPromises);

    // Extract secure URLs
    const imageUrls = uploadedImages.map(image => image.secure_url);

    // Clean up temporary files
    files.forEach(file => fs.unlinkSync(file.path));

    return imageUrls;
  } catch (err) {
    console.error('Error uploading images:', err.message);
    throw new Error('Image upload failed');
  }
};

module.exports = { uploadImagesToCloudinary };
