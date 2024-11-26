// /pages/api/uploadImage.js
import cloudinary from '@/utils/cloudinaryConfig';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { image } = req.body; // The base64 image data sent from frontend

      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'profile_pics',
        public_id: 'profile', // Optional: You can define a custom public_id here
        overwrite: true, // To overwrite the existing image with same public_id
      });

      res.status(200).json({ success: true, url: uploadResponse.secure_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error uploading image' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
