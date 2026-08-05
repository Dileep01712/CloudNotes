const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const nodemailer = require('nodemailer');
const Otp = require("../models/Otp");
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'thisistestjwt';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const isProd = process.env.NODE_ENV === 'production';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
        });
    }
    return null;
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ROUTE 1: Create user – POST "/api/auth/create-user"
router.post('/create-user', [
    body('name', 'Name must be at least 3 characters').trim().isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    try {
        const { name, email, password, otp } = req.body;
        const lowerEmail = email.toLowerCase();

        let user = await User.findOne({ email: lowerEmail });
        if (user) {
            return res.status(400).json({
                success: false,
                error: "A user with this email already exists."
            });
        }

        const otpRecord = await Otp.findOne({ email: lowerEmail });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code."
            });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await otpRecord.deleteOne({ email: lowerEmail });
                return res.status(400).json({
                    success: false,
                    message: "Too many wrong attempts. Please request a new code."
                });
            }

            return res.status(400).json({
                success: false,
                message: `Incorrect code. You have ${3 - otpRecord.attempts} attempts remaining.`
            });
        }

        await Otp.deleteMany({ email: lowerEmail });

        user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: password,
        });

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            accessToken,
            user
        });

    } catch (error) {
        console.error('Create user error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// ROUTE 2: Send OTP – POST "/api/auth/send-otp"
router.post('/send-otp', [
    body('name', 'Name must be at least 3 characters').trim().isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    const { email } = req.body;

    try {
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        await Otp.deleteMany({ email: email.toLowerCase() });

        const otp = generateOTP();

        await Otp.create({
            email: email.toLowerCase(),
            otp: otp
        });

        const mailOptions = {
            from: `"CloudNotes Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `CloudNotes Verification Code - ${otp}`,
            html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; padding: 20px 10px; min-height: 100%;">
                        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                            
                            <div style="text-align: center; margin-bottom: 28px;">
                                <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                    CloudNotes
                                </h2>
                            </div>
                            
                            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 600; text-align: center;">
                                Verify your email
                            </h3>
                            
                            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
                                Thank you for using CloudNotes. Use the verification code below to complete your security check. This code remains valid for 5 minutes.
                            </p>
                            
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 24px; border: 1px dashed #ced4da;">
                                <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #111827; display: inline-block; white-space: nowrap; padding-left: 4px;">${otp}</span>
                            </div>
                            
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                                If you didn't make this request, you can safely ignore this message. Someone might have typed your email address by mistake.
                            </p>
                            
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                            &copy; 2026 CloudNotes. Built for productivity.
                        </div>
                    </div>
                 `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Verification code sent to your email!"
        });

    } catch (error) {
        console.error('Send OTP error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code.'
        });
    }
});

// ROUTE 3: signin – POST "/api/auth/signin"
router.post('/signin', [
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 }).exists(),
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken,
            user
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// ROUTE 4: signout - POST "/api/auth/signout"
router.post('/signout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            if (decoded && decoded.user && decoded.user.id) {
                await User.updateOne(
                    { _id: decoded.user.id },
                    { $set: { refreshToken: null } }
                );
            }

        } catch (error) {
            console.log('Invalid refresh token during signout:', error.message);
        }
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

// ROUTE 5: Update user details – PUT "/api/auth/update-user"
router.put('/update-user', fetchuser, [
    body('name', 'Name must be at least 3 characters').optional().trim().isLength({ min: 3 }),
    body('email', 'Enter a valid email').optional().isEmail().normalizeEmail()
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    try {
        const { name, email } = req.body;

        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email.toLowerCase();

        if (email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });

            if (existingUser && existingUser.id.toString() !== req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: "This email is already in use by another account."
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error('Update user error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ROUTE 6: Request Password Reset – POST "/api/auth/forgot-password"
router.post('/forgot-password', [
    body("email", "Enter a valid email").isEmail().normalizeEmail(),
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        await Otp.deleteMany({ email: email.toLowerCase() });

        const otp = generateOTP();

        await Otp.create({
            email: email.toLowerCase(),
            otp: otp
        });

        const mailOptions = {
            from: `"CloudNotes Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `CloudNotes Account Recovery Code - ${otp}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f8; padding: 20px 10px; min-height: 100%;">
                    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                        <div style="text-align: center; margin-bottom: 28px;">
                            <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CloudNotes</h2>
                        </div>
                        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 600; text-align: center;">Reset your password</h3>
                        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
                            We received a request to reset your CloudNotes password. Use the verification code below to authorize this change. This code expires in <span style="font-weight: 700; color: #111827;">5 minutes</span>.
                        </p>
                        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 24px; border: 1px dashed #ced4da;">
                            <span style="font-family: monospace; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #111827; display: inline-block; white-space: nowrap; padding-left: 4px;">${otp}</span>
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                            If you did not request a password change, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Recovery code sent to your email!"
        });

    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ROUTE 7: Reset Password – POST "/api/auth/reset-password"
router.post('/reset-password', [
    body('email', 'Enter a valid email').isEmail().normalizeEmail(),
    body('otp', 'Enter a valid 6-digit code').isLength({ min: 6, max: 6 }),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 })
], async (req, res) => {
    const errorRes = handleValidationErrors(req, res);
    if (errorRes) return errorRes;

    const { email, otp, password } = req.body;
    const lowerEmail = email.toLowerCase();

    try {
        const otpRecord = await Otp.findOne({ email: lowerEmail });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired or is invalid."
            });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await otpRecord.deleteOne();
                return res.status(400).json({
                    success: false,
                    message: "Too many wrong attempts. Please request a new code."
                });
            }

            return res.status(400).json({
                success: false,
                message: `Incorrect code. You have ${3 - otpRecord.attempts} attempts remaining.`
            });
        }

        const user = await User.findOne({ email: lowerEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        user.password = password;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully! You can now log in."
        });

    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ROUTE 8: Refresh Token - POST "/api/auth/refresh-token"
router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const userId = decoded.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        const result = await User.updateOne(
            { _id: userId, refreshToken: refreshToken },
            { $set: { refreshToken: newRefreshToken } }
        );

        if (result.modifiedCount === 0) {
            res.clearCookie('refreshToken');
            return res.status(401).json({ success: false, error: 'Refresh token already used' });
        }

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, accessToken: newAccessToken });

    } catch (error) {
        console.error('Refresh token error details:', error);
        if (error.name === "TokenExpiredError") {
            res.clearCookie('refreshToken');
            return res.status(401).json({ success: false, error: 'Refresh token expired. Please signin again.' });
        }
        return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
});

// ROUTE 9: Get user – POST "/api/auth/get-user"
router.post('/get-user', fetchuser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;