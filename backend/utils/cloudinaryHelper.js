import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer, folder = 'general') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(new Error('Failed to upload image to Cloudinary'));
                }
                
                resolve(result.secure_url);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (fileUrl) => {
    if(!fileUrl) return;

    try {
        const urlParts = fileUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        const filePathParts = urlParts.slice(uploadIndex + 2);
        const filePathWithExtension = filePathParts.join('/');

        const publicId = filePathWithExtension.split('.').slice(0, -1).join('.');

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Failed to delete old image from Cloudinary:', error.message);
    }
};