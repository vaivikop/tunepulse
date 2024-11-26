import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import { getServerSession } from 'next-auth';
import dbConnect from '@/utils/dbconnect'; // Assuming this is your MongoDB connection utility
import User from '@/models/User'; // User model to update user profile

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Log the incoming request
    console.log("Received request to update profile image");

    // Get the session and user
    const session = await getServerSession();
    if (!session || !session.user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id; // Assuming you store user id in session

    // Extract image from form-data
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      console.error("No image file uploaded");
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    console.log("Image file received:", imageFile);

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(imageFile.stream(), {
      folder: 'user_profiles', // Optional: Cloudinary folder for user images
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 300, height: 300, crop: 'fill' }], // Optional: Resize the image
    });

    const imageUrl = uploadResponse.secure_url; // Get the URL of the uploaded image
    console.log("Image uploaded to Cloudinary:", imageUrl);

    // Connect to the database
    await dbConnect();

    // Update user's profile with the new image URL in the database
    const updatedUser = await User.findByIdAndUpdate(userId, { imageUrl }, { new: true });

    console.log("User profile updated:", updatedUser);

    return NextResponse.json({ imageUrl, user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error uploading image and updating profile:', error);
    return NextResponse.json(
      { error: 'Error uploading image and updating profile' },
      { status: 500 }
    );
  }
}
