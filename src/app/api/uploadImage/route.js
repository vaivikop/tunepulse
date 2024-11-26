import cloudinary from '@/utils/cloudinaryConfig';
import User from '@/models/User';
import dbConnect from '@/utils/dbconnect';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Ensure the user is authenticated (you can implement authentication check as needed)
      // e.g., using JWT token or session data

      const { image, userId } = req.body; // Assuming `userId` is passed to identify the user

      if (!image || !userId) {
        return res.status(400).json({ success: false, message: 'Image or userId missing' });
      }

      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'profile_pics',
        public_id: `profile_${userId}`, // Optional: You can define a custom public_id based on the userId
        overwrite: true, // To overwrite the existing image with the same public_id
      });

      // Connect to the database
      await dbConnect();

      // Update the user's imageUrl in MongoDB
      const user = await User.findByIdAndUpdate(
        userId,
        { imageUrl: uploadResponse.secure_url },
        { new: true }
      );

      // Send success response with the updated image URL
      res.status(200).json({ success: true, url: uploadResponse.secure_url, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error uploading image' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
