const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult, param } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const Folder = require('../models/Folder');

const NOTE_EXPIRATION_MS = Number(process.env.NOTE_EXPIRATION_MS) || Number(process.env.EXPIRATION_MS_DEFAULT);
if (isNaN(NOTE_EXPIRATION_MS)) {
    console.error('Invalid NOTE_EXPIRATION_MS, using default');
    NOTE_EXPIRATION_MS = EXPIRATION_MS_DEFAULT;
}

const formatSentence = (str) => {
    if (!str) return str;
    const trimmed = str.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const formatTag = (str) => {
    if (!str) return str;
    return str.toLowerCase().trim();
};

const validateRequest = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    return null;
};

// ROUTE 1: Fetch all notes - GET "/api/note/fetch-all-notes"
router.get('/fetch-all-notes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
            .select('-__v -user')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ success: true, notes });
    } catch (error) {
        console.error('fetchallnotes error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 2: Fetch notes by directory - GET "/api/note/fetch/:directoryId"
router.get('/fetch/:directoryId', fetchuser, async (req, res) => {
    try {
        const { directoryId } = req.params;
        const query = { user: req.user.id };

        if (mongoose.Types.ObjectId.isValid(directoryId)) {
            query.parent = directoryId;
        } else if (directoryId === 'none') {
            query.parent = null;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid directory ID' });
        }

        const notes = await Note.find(query)
            .select('-__v -user')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ success: true, notes });

    } catch (error) {
        console.error('fetch by directory error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 3: Add a new note - POST "/api/note/add-note"
router.post('/add-note', fetchuser, [
    body('title').optional().trim(),
    body('description', 'Description is required').optional(),
    body('tag').optional().trim(),
    body('parent').optional({ nullable: true }).custom(value => {
        if (value === null || value === undefined) return true;
        return mongoose.Types.ObjectId.isValid(value);
    }).withMessage('Invalid parent folder ID')
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { title, description, tag, parent } = req.body;
        const noteData = {
            title: title ? formatSentence(title) : "",
            description: description ? formatSentence(description) : '',
            tag: tag ? formatTag(tag) : '',
            user: req.user.id
        };
        if (parent && mongoose.Types.ObjectId.isValid(parent)) {
            const folder = await Folder.findOne({ _id: parent, user: req.user.id });
            if (!folder) {
                return res.status(404).json({ success: false, error: 'Parent folder not found' });
            }
            noteData.parent = parent;
        }

        const note = new Note(noteData);
        const savedNote = await note.save();
        res.status(201).json({ success: true, note: savedNote });
    } catch (error) {
        console.error('addnote error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 4: Update a note - PUT "/api/note/update-note/:id"
router.put('/update-note/:id', fetchuser, [
    param('id').isMongoId().withMessage('Invalid note ID'),
    body('parentId').optional({ nullable: true }).isMongoId().withMessage('Invalid parent folder ID'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('tag').optional().trim(),
    body('parentName').optional().trim(),
    body('pinnedAt').optional().isObject(),
    body('expireAt').optional().isObject(),
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { id } = req.params;
        const { title, description, tag, pinnedAt, expireAt, parentId } = req.body;

        const existingNote = await Note.findOne({ _id: id, user: req.user.id });
        if (!existingNote) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        const updateFields = {};
        let contentChanged = false;

        if (title !== undefined) {
            const formattedTitle = formatSentence(title);
            if (formattedTitle !== existingNote.title) {
                updateFields.title = formattedTitle;
                contentChanged = true;
            }
        }

        if (tag !== undefined) {
            const formattedTagStr = formatTag(tag);
            if (formattedTagStr !== existingNote.tag) {
                updateFields.tag = formattedTagStr;
                contentChanged = true;
            }
        }

        if (description !== undefined) {
            const formattedDesc = formatSentence(description);
            if (formattedDesc !== existingNote.description) {
                updateFields.description = formattedDesc;
                contentChanged = true;
            }
        }

        if (parentId !== undefined) {
            if (parentId === null) {
                updateFields.parent = null;
            } else if (parentId !== '') {
                const folder = await Folder.findOne({ _id: parentId, user: req.user.id });
                if (!folder) {
                    return res.status(404).json({ success: false, error: 'Target folder not found' });
                }
                updateFields.parent = folder._id;
            }
        }

        if (pinnedAt) {
            if (pinnedAt.status === false) {
                updateFields.pinnedAt = null;
            } else if (pinnedAt.status === true && pinnedAt.value) {
                updateFields.pinnedAt = pinnedAt.value;
            }
        }

        if (expireAt) {
            if (expireAt.status === false) {
                updateFields.expireAt = null;
                updateFields.trashedAt = null;
            } else if (expireAt.status === true) {
                const expirationDate = new Date(Date.now() + NOTE_EXPIRATION_MS);
                updateFields.expireAt = expirationDate;
                updateFields.trashedAt = new Date();
            }
        }

        if (contentChanged) {
            updateFields.updatedAt = new Date();
        }

        const updateOptions = { new: true, runValidators: true };

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { $set: updateFields },
            updateOptions
        );

        res.json({ success: true, note: updatedNote });
    } catch (error) {
        console.error('updatenote error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 5: Delete a note - DELETE "/api/note/delete-note/:id"
router.delete('/delete-note/:id', fetchuser, [
    param('id').isMongoId().withMessage('Invalid note ID')
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { id } = req.params;
        const note = await Note.findOneAndDelete({ _id: id, user: req.user.id });
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        res.json({ success: true, message: 'Note deleted successfully', note });
    } catch (error) {
        console.error('deletenote error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;