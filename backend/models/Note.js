const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true,
    },
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        default: "",
    },
    tag: {
        type: String,
        default: "General",
        trim: true,
    },
    typeName: {
        type: String,
        default: 'note',
        enum: ['note'],
        immutable: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null,
        index: true,
    },
    pinnedAt: {
        type: Date,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: null
    },
    trashedAt: {
        type: Date,
        default: null
    },
    expireAt: {
        type: Date,
        default: null,
    },
},
    {
        timestamps: { createdAt: 'createdAt', updatedAt: false },
        collection: 'notes'
    }
);

NotesSchema.index({ user: 1, parent: 1 });
NotesSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

NotesSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret._id = ret._id.toString();
        if (ret.pinnedAt) ret.pinnedAt = ret.pinnedAt.getTime();
        if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
        if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
        if (ret.expireAt) ret.expireAt = ret.expireAt.toISOString();
        if (ret.trashedAt) ret.trashedAt = ret.trashedAt.toISOString();
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Notes', NotesSchema);