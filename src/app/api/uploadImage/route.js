import cloudinary from '@/utils/cloudinaryConfig'; // Cloudinary config
import { NextResponse } from 'next/server'; // Import NextResponse for handling responses

// Handle POST request for image upload
export async function POST(req) {
  try {
    // Parse the incoming request JSON body to get the image data
    const { image } = await req.json(); 

    if (!image) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'No image data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'profile_pics', // Optional folder to organize the images
    });

    // Log the Cloudinary image URL
    console.log('Uploaded Image URL:', uploadResponse.secure_url);

    // Return the Cloudinary URL in the response
    return new NextResponse(
      JSON.stringify({
        success: true,
        imageUrl: uploadResponse.secure_url, // Cloudinary URL
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Error uploading image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
