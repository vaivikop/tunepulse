import { v2 as cloudinary } from 'cloudinary';
import User from '@/models/User'; // Assuming User model is defined for MongoDB
import connectDB from '@/utils/dbconnect'; // Assuming you have a MongoDB connection utility

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req, res) {
  try {
    await connectDB(); // Make sure DB is connected

    const formData = await req.formData(); // Access the form data
    const image = formData.get('image'); // Extract the image file

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), { status: 400 });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'user_profiles', // Folder on Cloudinary
    });

    // Get the URL of the uploaded image
    const imageUrl = result.secure_url;

    // Update the user's profile image URL in MongoDB
    const user = await User.findById(req.user._id); // Assuming req.user contains user info
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    user.imageUrl = imageUrl; // Update the user's imageUrl
    await user.save();

    return new Response(JSON.stringify({ imageUrl }), { status: 200 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(JSON.stringify({ error: 'Error uploading image' }), { status: 500 });
  }
}
