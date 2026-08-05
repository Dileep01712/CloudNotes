const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'thisistestjwt';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                const strictEmailRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                return strictEmailRegex.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    refreshToken: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: null
    }
});

UserSchema.index({ email: 1 });

UserSchema.pre('save', async function (next) {
    if (!this.isNew) {
        this.updatedAt = Date.now();
    }

    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    const payload = { user: { id: this._id } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

UserSchema.methods.generateRefreshToken = function () {
    const payload = { user: { id: this._id } };
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

UserSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshToken;
        return ret;
    }
});

module.exports = mongoose.model('User', UserSchema);