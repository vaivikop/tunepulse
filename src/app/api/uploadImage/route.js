// /app/api/uploadImage/route.js
import cloudinary from '@/utils/cloudinaryConfig'; // Cloudinary configuration
import User from '@/models/User'; // Assuming User model exists
import dbConnect from '@/utils/dbconnect'; // MongoDB connection utility

// POST handler to upload image
export async function POST(req) {
  try {
    const { image, userId } = await req.json(); // Extract image and userId from the request body

    if (!image || !userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Image or userId missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    await dbConnect();

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'profile_pics',
      public_id: `profile_${userId}`, // Unique public_id for each user's profile
      overwrite: true, // Overwrite any existing image with the same public_id
    });

    // Update the user's image URL in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { imageUrl: uploadResponse.secure_url }, 
      { new: true }
    );

    // Return the updated image URL and user data
    return new Response(
      JSON.stringify({ success: true, imageUrl: uploadResponse.secure_url, user: updatedUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error uploading image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
