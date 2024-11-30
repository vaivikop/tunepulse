import { getToken } from "next-auth/jwt";
import User from "@/models/User";
import dbConnect from "@/utils/dbconnect";
import { NextResponse } from "next/server";

// Get user info
export async function GET(req) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    
    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: "User not logged in",
                data: null
            },
            { status: 401 }
        );
    }

    try {
        await dbConnect();

        // Find user by email (which should be unique)
        const user = await User.findOne({ email: token.email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                    data: null
                },
                { status: 404 }
            );
        }

        // Return the user details, including userId (if needed)
        return NextResponse.json(
            {
                success: true,
                message: "User found",
                data: {
                    userId: user._id,   // Add userId here
                    userName: user.userName,
                    email: user.email,
                    imageUrl: user.imageUrl,
                    isVerified: user.isVerified
                }
            }
        );

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
                data: null
            },
            { status: 500 }
        );
    }
}
