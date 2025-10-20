// utils/cloudinarySign.js
import crypto from 'crypto';

export const generateCloudinarySignature = (params) => {
  const { folder, timestamp } = params;
  const secret = process.env.CLOUDINARY_API_SECRET;
  
  const signatureString = `folder=${folder}&timestamp=${timestamp}`;
  return crypto
    .createHash('sha1')
    .update(signatureString + secret)
    .digest('hex');
};