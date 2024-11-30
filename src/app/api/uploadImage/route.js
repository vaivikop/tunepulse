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
  console.log('Incoming POST request to /api/uploadImage');
  try {
    // Step 1: Connect to the database
    console.log('Connecting to the database...');
    await connectDB();
    console.log('Database connection successful.');

    // Step 2: Parse form data from the request
    console.log('Parsing form data...');
    const formData = await req.formData();
    const image = formData.get('image');
    console.log('Form data parsed. Image received:', !!image);

    if (!image) {
      console.error('No image file provided in the request.');
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Step 3: Upload the image to Cloudinary
    console.log('Uploading image to Cloudinary...');
    const result = await cloudinary.uploader.upload(image, {
      folder: 'user_profiles', // Specify folder
    });
    console.log('Image uploaded to Cloudinary. URL:', result.secure_url);

    const imageUrl = result.secure_url;

    // Step 4: Retrieve the user ID from headers
    console.log('Retrieving user ID from headers...');
    const userId = req.headers.get('user-id');
    if (!userId) {
      console.error('User ID not provided in the request headers.');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    console.log('User ID:', userId);

    // Step 5: Find the user in the database
    console.log('Fetching user from database...');
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found in the database.');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('User found:', user);

    // Step 6: Update the user's profile image URL
    console.log('Updating user profile image URL...');
    user.imageUrl = imageUrl;
    await user.save();
    console.log('User profile updated successfully.');

    // Step 7: Respond with the image URL
    console.log('Sending response with image URL.');
    return NextResponse.json({ success: true, imageUrl }, { status: 200 });
  } catch (error) {
    // Step 8: Handle errors
    console.error('Error occurred during image upload:', error);
    return NextResponse.json({ error: 'Error uploading image', details: error.message }, { status: 500 });
  }
}
