import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST method to handle image upload and update profile
export async function POST(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "User not logged in",
        data: null,
      },
      { status: 401 }
    );
  }

  try {
    await dbConnect();

    // Get the image file from the request body
    const formData = await req.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          message: "No image file provided",
          data: null,
        },
        { status: 400 }
      );
    }

    // Upload the image to Cloudinary
    const uploadedImage = await cloudinary.v2.uploader.upload(imageFile.stream(), {
      folder: "user_profiles", // You can set the folder in Cloudinary
      allowed_formats: ["jpg", "jpeg", "png"], // Allowed image formats
      transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional transformation
    });

    // Get the URL of the uploaded image
    const imageUrl = uploadedImage.secure_url;

    // Update the user's profile with the new image URL
    const updatedUser = await User.findOneAndUpdate(
      { email: token.email },
      { imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        { status: 404 }
      );
    }

    // Return the updated user data
    return NextResponse.json(
      {
        success: true,
        message: "Profile image updated successfully",
        data: {
          userName: updatedUser.userName,
          email: updatedUser.email,
          imageUrl: updatedUser.imageUrl,
          isVerified: updatedUser.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        data: null,
      },
      { status: 500 }
    );
  }
}
