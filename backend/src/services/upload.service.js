import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Folder path in Cloudinary
 * @param {string} resourceType - 'image', 'raw', 'video', 'auto'
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'medilink', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: resourceType === 'image' ? [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ] : [],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload file'));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Upload document (certificate, ID, etc.)
 * @param {Express.Multer.File} file - Multer file object
 * @param {string} documentType - Type of document (certificate, id, license)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Upload result
 */
export const uploadDocument = async (file, documentType, userId) => {
  try {
    const folder = `medilink/${documentType}/${userId}`;
    const result = await uploadToCloudinary(
      file.buffer,
      folder,
      file.mimetype === 'application/pdf' ? 'raw' : 'image'
    );

    return {
      success: true,
      url: result.url,
      publicId: result.public_id,
      documentType,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadDocument,
};

