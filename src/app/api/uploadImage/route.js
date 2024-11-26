import { v2 as cloudinary } from 'cloudinary';
import User from '@/models/User'; // Assuming User model is defined for MongoDB
import connectDB from '@/utils/dbconnect'; // Assuming you have a MongoDB connection utility

// Configure Cloudinary (if not done already)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectDB(); // Make sure DB is connected

      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(image, {
        folder: 'user_profiles', // You can set a specific folder on Cloudinary
      });

      // Get the URL of the uploaded image
      const imageUrl = result.secure_url;

      // Find the current user and update the profile image URL in MongoDB
      const user = await User.findById(req.user._id); // Assuming the user ID is in the request
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.imageUrl = imageUrl; // Update the user's imageUrl
      await user.save(); // Save the changes

      // Respond with the updated user data or the image URL
      res.status(200).json({ imageUrl });

    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Error uploading image' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
