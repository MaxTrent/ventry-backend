import multer from "multer";
import path from "path";
import {v4 as uuidv4} from 'uuid';
import e from "express";
import {Error} from "mongoose";

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/cars/');
    },
    filename(req, file, callback) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        callback(null, uniqueName);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback)=>{
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } //5mb
});