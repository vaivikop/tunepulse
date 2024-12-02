const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail", // Use Gmail's SMTP
            auth: {
                user: process.env.MAIL_USER, // Your Gmail email address
                pass: process.env.MAIL_PASS, // App password (not your Gmail password)
            },
        });

        let info = await transporter.sendMail({
            from: `"TunePulse Support" | <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
            headers: {
                "X-Priority": "1", // High priority
                "X-MSMail-Priority": "High",
                Importance: "High",
            },
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
};

export default mailSender;
