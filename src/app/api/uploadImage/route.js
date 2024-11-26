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
    // Step 1: Log the start of the request
    console.log("Received request to update profile image");

    // Step 2: Get session and verify if user is authenticated
    const session = await getServerSession();
    if (!session || !session.user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id; // Assuming user ID is stored in session

    // Step 3: Extract image file from the incoming request
    const formData = await req.formData();
    const imageFile = formData.get('image');

    // Debugging: Check if image is received
    if (!imageFile) {
      console.error("No image file uploaded");
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }
    console.log("Image file received:", imageFile);

    // Step 4: Upload image to Cloudinary
    try {
      const uploadResponse = await cloudinary.v2.uploader.upload(imageFile.stream(), {
        folder: 'user_profiles', // Optional: Cloudinary folder for user images
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 300, height: 300, crop: 'fill' }], // Optional: Resize the image
      });

      // Step 5: Log Cloudinary upload response
      console.log("Cloudinary upload response:", uploadResponse);

      // Step 6: Check for errors in Cloudinary response
      if (!uploadResponse || !uploadResponse.secure_url) {
        console.error("Cloudinary upload failed. No image URL returned.");
        return NextResponse.json({ error: 'Failed to upload image to Cloudinary' }, { status: 500 });
      }

      const imageUrl = uploadResponse.secure_url; // Get the URL of the uploaded image
      console.log("Image uploaded to Cloudinary:", imageUrl);

      // Step 7: Connect to MongoDB and update the user's profile image URL
      await dbConnect(); // Assuming dbConnect sets up the MongoDB connection

      const updatedUser = await User.findByIdAndUpdate(userId, { imageUrl }, { new: true });

      // Debugging: Check if the user was updated successfully
      if (!updatedUser) {
        console.error("Failed to update user profile in MongoDB.");
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
      }

      console.log("User profile updated successfully:", updatedUser);

      // Step 8: Return successful response
      return NextResponse.json({ imageUrl, user: updatedUser }, { status: 200 });
    } catch (uploadError) {
      console.error("Error during Cloudinary upload:", uploadError);
      return NextResponse.json({ error: 'Error uploading image to Cloudinary' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading image and updating profile:', error);
    return NextResponse.json(
      { error: 'Error uploading image and updating profile' },
      { status: 500 }
    );
  }
}
