import cloudinary from '@/utils/cloudinaryConfig'; // Import cloudinary configuration
import User from '@/models/User'; // Assuming User model exists
import dbConnect from '@/utils/dbconnect'; // Assuming dbConnect utility exists to connect to MongoDB

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { image, userId } = req.body; // Get the image and userId from the request body

      if (!image || !userId) {
        return res.status(400).json({ success: false, message: 'Image or userId missing' });
      }

      // Connect to the database
      await dbConnect();

      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'profile_pics',
        public_id: `profile_${userId}`, // Unique public_id for each user's profile
        overwrite: true, // Overwrite any existing image with the same public_id
      });

      // Update the user's imageUrl in MongoDB
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        { imageUrl: uploadResponse.secure_url }, 
        { new: true }
      );

      // Return the updated image URL and user data
      res.status(200).json({ success: true, imageUrl: uploadResponse.secure_url, user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error uploading image' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
