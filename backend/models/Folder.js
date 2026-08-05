const mongoose = require('mongoose');
const { Schema } = mongoose;

const FolderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null,
        index: true
    },
    typeName: {
        type: String,
        default: 'folder',
        enum: ['folder'],
        immutable: true
    },
    color: {
        type: String,
        default: 'none',
        trim: true
    },
    updatedAt: {
        type: Date,
        default: null,
    },
    pinnedAt: {
        type: Date,
        default: null,
    },
    trashedAt: {
        type: Date,
        default: null,
    },
    expireAt: {
        type: Date,
        default: null,
    },
},
    {
        timestamps: { createdAt: "createdAt", updatedAt: false },
        collection: 'folders'
    }
);

FolderSchema.index({ user: 1, parent: 1 });
FolderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

FolderSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret._id = ret._id.toString();
        if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
        if (ret.pinnedAt) ret.pinnedAt = ret.pinnedAt.getTime();
        if (ret.trashedAt) ret.trashedAt = ret.trashedAt.toISOString();
        if (ret.expireAt) ret.expireAt = ret.expireAt.toISOString();
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Folder', FolderSchema);