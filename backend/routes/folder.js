const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult, param } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const Folder = require('../models/Folder');

const FOLDER_EXPIRATION_MS = Number(process.env.FOLDER_EXPIRATION_MS) || Number(process.env.EXPIRATION_MS_DEFAULT);
if (isNaN(FOLDER_EXPIRATION_MS)) {
    console.error('Invalid FOLDER_EXPIRATION_MS, using default');
    FOLDER_EXPIRATION_MS = EXPIRATION_MS_DEFAULT;
}

const formatFolderName = (str) => {
    const formatted = str.replace(/[^\w\s]/gi, '');
    const final = formatted.replace(/\s+/g, '-');
    return final ? final + '-' : final;
};

const findPath = async (id) => {
    const folder = await Folder.findById(id).lean();
    if (!folder) return [];
    if (folder.parent === null) {
        return [{
            title: folder.title,
            url: formatFolderName(folder.title) + folder._id
        }];
    }
    const parentPath = await findPath(folder.parent);
    parentPath.push({
        title: folder.title,
        url: formatFolderName(folder.title) + folder._id
    });
    return parentPath;
};

const deleteFolderAndChildren = async (folderId) => {
    await Note.deleteMany({ parent: folderId });
    const children = await Folder.find({ parent: folderId }).lean();

    await Promise.all(children.map(child => deleteFolderAndChildren(child._id)));

    await Folder.findByIdAndDelete(folderId);
};

const validateRequest = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    return null;
};

// ROUTE 1: Fetch all folders - GET "/api/folder/fetch-all-folders"
router.get('/fetch-all-folders', fetchuser, async (req, res) => {
    try {
        const folders = await Folder.find({ user: req.user.id })
            .select('-__v -user')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ success: true, folders });
    } catch (error) {
        console.error('fetchallfolders error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 2: Create a folder - POST "/api/folder/create-folder"
router.post('/create-folder', fetchuser, [
    body('title', 'Folder name is required').trim().notEmpty(),
    body('parent').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid parent folder ID')
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { title, parent } = req.body;
        const folderData = { title: title.trim(), user: req.user.id };

        if (parent && mongoose.Types.ObjectId.isValid(parent)) {
            const parentFolder = await Folder.findOne({ _id: parent, user: req.user.id });
            if (!parentFolder) {
                return res.status(404).json({ success: false, error: 'Parent folder not found' });
            }
            folderData.parent = parent;
        }

        const existing = await Folder.findOne({
            user: req.user.id,
            title: folderData.title,
            parent: parent || null
        });
        if (existing) {
            return res.status(409).json({ success: false, error: 'Folder with same name already exists in this location' });
        }

        const folder = new Folder(folderData);
        const savedFolder = await folder.save();

        res.status(201).json({ success: true, folder: savedFolder });

    } catch (error) {
        console.error('createFolder error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 3: Update a folder - PUT "/api/folder/update-folder/:id"
router.put('/update-folder/:id', fetchuser, [
    param('id').isMongoId().withMessage("Invalid folder ID"),
    body('title', "Folder name can not be empty").optional().trim().notEmpty(),
    body('parent').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Invalid parent folder ID"),
    body('color').optional({ nullable: true }).isString(),
    body('pinnedAt').optional().isObject(),
    body('expireAt').optional().isObject(),
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { id } = req.params;
        const { title, parent, color, pinnedAt, expireAt } = req.body;

        const folder = await Folder.findOne({ _id: id, user: req.user.id });
        if (!folder) {
            return res.status(404).json({ success: false, error: "Folder not found" });
        }

        const updateData = {};
        let contentChanged = false;

        if (title !== undefined) {
            const finalTitle = title.trim();
            if (finalTitle !== folder.title) {
                updateData.title = finalTitle;
                contentChanged = true;
            }
        }

        if (color !== undefined) {
            const finalColor = color === null ? 'none' : color.trim();
            if (finalColor !== folder.color) {
                updateData.color = finalColor;
            }
        }

        if (parent !== undefined) {
            if (parent === id) {
                return res.status(400).json({ success: false, error: "A folder cannot be its own parent" });
            }
            if (parent && !mongoose.Types.ObjectId.isValid(parent)) {
                return res.status(400).json({ success: false, error: "Invalid parent folder ID" });
            }
            if (parent) {
                const parentFolder = await Folder.findOne({ _id: parent, user: req.user.id });
                if (!parentFolder) {
                    return res.status(404).json({ success: false, error: "Target parent folder not found" });
                }
            }
            const finalParent = parent || null;
            if (finalParent !== folder.parent) {
                updateData.parent = finalParent;
                contentChanged = true;
            }
        }

        if (contentChanged && updateData.title !== undefined || updateData.parent !== undefined) {
            const existing = await Folder.findOne({
                user: req.user.id,
                title: updateData.title !== undefined ? updateData.title : folder.title,
                parent: updateData.parent !== undefined ? updateData.parent : folder.parent,
                _id: { $ne: id }
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    error: "A folder with this name already exists in the destination"
                });
            }
        }

        if (pinnedAt) {
            if (pinnedAt.status === false) {
                updateData.pinnedAt = null;
            } else if (pinnedAt.status === true && pinnedAt.value) {
                updateData.pinnedAt = new Date(pinnedAt.value);
            }
        }

        if (expireAt) {
            if (expireAt.status === false) {
                updateData.expireAt = null;
                updateData.trashedAt = null;

                await Note.updateMany(
                    { parent: id, user: req.user.id },
                    { $set: { expireAt: null, trashedAt: null } }
                );
            } else if (expireAt.status === true) {
                const expirationDate = new Date(Date.now() + FOLDER_EXPIRATION_MS);
                updateData.expireAt = expirationDate;
                updateData.trashedAt = new Date();

                await Note.updateMany(
                    { parent: id, user: req.user.id },
                    { $set: { expireAt: expirationDate, trashedAt: new Date(), pinnedAt: null } }
                );
            }
        }

        if (contentChanged) {
            updateData.updatedAt = new Date();
        }

        if (Object.keys(updateData).length === 0) {
            return res.json({ success: true, folder });
        }

        const updateFolder = await Folder.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { $set: updateData },
            { new: true }
        );

        return res.json({ success: true, folder: updateFolder });

    } catch (error) {
        console.error("updateFolder error: ", error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ROUTE 4: Delete a folder and all its contents - DELETE "/api/folder/delete-folder/:id"
router.delete('/delete-folder/:id', fetchuser, [
    param('id').isMongoId().withMessage('Invalid folder ID')
], async (req, res) => {
    const errorRes = validateRequest(req, res);
    if (errorRes) return errorRes;

    try {
        const { id } = req.params;
        const folder = await Folder.findOne({ _id: id, user: req.user.id });
        if (!folder) {
            return res.status(404).json({ success: false, error: 'Folder not found' });
        }

        await deleteFolderAndChildren(id);
        res.json({ success: true, message: 'Folder and all contents deleted successfully', folder });
    } catch (error) {
        console.error('deletefolder error:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;