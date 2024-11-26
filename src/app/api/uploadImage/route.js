import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import connectDB from '@/utils/dbconnect'; // Your MongoDB connection utility
import User from '@/models/User'; // Your user model

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await connectDB(); // Connect to DB

    const formData = await req.formData(); // Get form data
    const image = formData.get('image'); // Get the image file

    if (!image) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'user_profiles', // Optional, specify folder
    });

    const imageUrl = result.secure_url; // Get the URL of the uploaded image

    // Assuming the user is logged in and we have access to the user ID
    const userId = req.headers.get('user-id'); // Replace with actual user ID logic
    const user = await User.findById(userId); // Find user in DB

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's profile image URL
    user.imageUrl = imageUrl;
    await user.save();

    // Respond with the image URL
    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
  }
}
