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
    // Step 1: Connect to the database
    await connectDB();

    // Step 2: Parse form data from the request
    const formData = await req.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Step 3: Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'user_profiles', // Specify folder
    });

    const imageUrl = result.secure_url;

    // Step 4: Retrieve the user ID from the request (assuming userId is passed as JSON)
    const { userId } = await req.json(); // Assuming userId is in the body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Step 5: Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 6: Update the user's profile image URL
    user.imageUrl = imageUrl;
    await user.save();

    // Step 7: Respond with the image URL
    return NextResponse.json({ success: true, imageUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error uploading image', details: error.message }, { status: 500 });
  }
}
