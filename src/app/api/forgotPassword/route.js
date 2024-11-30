import { NextResponse } from "next/server";
import User from "@/models/User";
import mailSender from "@/utils/mailSender";
import dbConnect from "@/utils/dbconnect";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Forgot password mail
export async function POST(request) {
    const { email } = await request.json();
    if (!email) {
        return NextResponse.json(
            {
                success: false,
                message: "Email is required",
                data: null
            },
            { status: 400 }
        );
    }
    try {
        await dbConnect();
        const user = await User.findOne({ email: email });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No account found with this email address",
                    data: null
                },
                { status: 404 }
            );
        }

        const resetPasswordToken = crypto.randomBytes(20).toString('hex'); 
        const resetPasswordExpires = Date.now() + 300000; // 5 minutes expiration

        const updatedUser = await User.findByIdAndUpdate(user._id, {
            resetPasswordToken,
            resetPasswordExpires
        }, { new: true });

        if (!updatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error updating user data",
                    data: null
                },
                { status: 500 }
            );
        }

        const url = `${process.env.NEXTAUTH_URL}/reset-password/${resetPasswordToken}`;
        const title = "Password Reset Request";
        const body = `
            <p>Hello ${user.name || "User"},</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>If you did request a password reset, please click the link below to create a new password:</p>
            <p><a href="${url}" style="color: #1d72b8; text-decoration: none; font-weight: bold;">Reset Password</a></p>
            <p>This link will expire in 5 minutes.</p>
            <p>If you have any questions, feel free to contact us.</p>
            <p>Best regards,<br/>Your Support Team</p>
        `;
        const mail = await mailSender(user.email, title, body);

        if (mail) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Password reset email has been sent",
                    data: null
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to send password reset email. Please try again later.",
                data: null
            },
            { status: 500 }
        );

    } catch (e) {
        console.error('Forgot password error', e);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again later.",
                data: null
            },
            { status: 500 }
        );
    }
}

// Reset password
export async function PUT(request) {
    const { token, password, confirmPassword } = await request.json();
    if (!token || !password || !confirmPassword) {
        return NextResponse.json(
            {
                success: false,
                message: "Please fill all the fields",
                data: null
            },
            { status: 400 }
        );
    }

    try {
        // Check if token is valid
        await dbConnect();
        const checkToken = await User.findOne({ 
            resetPasswordToken: token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });
        
        if (!checkToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token expired or invalid",
                    data: null
                },
                { status: 401 }
            );
        }

        // Check if password and confirm password are same
        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password and confirm password do not match",
                    data: null
                },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        const updatedUser = await User.findByIdAndUpdate(checkToken._id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        }, { new: true });

        if (!updatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error updating password",
                    data: null
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Password updated successfully",
                data: null
            }
        );

    } catch (e) {
        console.error('Reset password error', e);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again later.",
                data: null
            },
            { status: 500 }
        );
    }
}
