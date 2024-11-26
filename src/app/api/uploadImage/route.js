// /app/api/uploadImage/route.js
import cloudinary from '@/utils/cloudinaryConfig'; // Cloudinary configuration
import User from '@/models/User'; // User model
import dbConnect from '@/utils/dbconnect'; // MongoDB connection utility
import { toast } from 'react-hot-toast'; // Toast for client-side feedback

// POST handler to upload image
export async function POST(req) {
  try {
    // Extract image and userId from the request body
    const { image, userId } = await req.json();
    console.log("Received Image and User ID:", { image, userId });

    // Validate the incoming data
    if (!image || !userId) {
      console.error("Error: Missing image or userId");
      return new Response(
        JSON.stringify({ success: false, message: 'Image or userId missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    console.log("Connecting to database...");
    await dbConnect();

    // Upload the image to Cloudinary
    console.log("Uploading image to Cloudinary...");
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'profile_pics',
      public_id: `profile_${userId}`, // Unique public_id for each user's profile
      overwrite: true, // Overwrite any existing image with the same public_id
    });
    console.log("Cloudinary upload response:", uploadResponse);

    // Update the user's image URL in MongoDB
    console.log("Updating user's image URL in the database...");
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { imageUrl: uploadResponse.secure_url }, 
      { new: true }
    );
    console.log("Updated user:", updatedUser);

    // Return the updated image URL and user data
    return new Response(
      JSON.stringify({ success: true, imageUrl: uploadResponse.secure_url, user: updatedUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error uploading image:", error);

    // Show toast notification for the error
    toast.error("Error uploading image: " + error?.message || "Unknown error");

    return new Response(
      JSON.stringify({ success: false, message: 'Error uploading image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
