const mongoose = require("mongoose");
const { Schema } = mongoose;

const OtpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    }
});

OtpSchema.index({ email: 1 });

const Otp = mongoose.model("Otp", OtpSchema);
module.exports = Otp;