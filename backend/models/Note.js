const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        default: "General"
    },
    date: {
        type: Date,
        default: Date.now
    },
    typeName: {
        type: String,
        default: "note"
    },
    pinnedAt: {
        type: Date
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    expireAt: {
        type: Date,
        expires: 1,
    }
}, { collection: 'notes' })

module.exports = mongoose.model('Notes', NotesSchema);