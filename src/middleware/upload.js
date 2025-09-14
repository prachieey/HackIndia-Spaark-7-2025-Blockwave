const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for memory storage (to use with sharp)
const multerStorage = multer.memoryStorage();

// Test if uploaded file is an image
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware to process and save a single image
const uploadImage = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }

      if (!req.file) return next();

      try {
        // Generate a unique filename
        const filename = `${fieldName}-${Date.now()}.jpeg`;
        const filepath = path.join(uploadDir, filename);

        // Process and save the image
        await sharp(req.file.buffer)
          .resize(1200, 800, {
            fit: 'cover',
            position: 'center',
          })
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(filepath);

        // Save the filename to the request object for use in the controller
        req.file.filename = filename;
        req.file.path = `/uploads/${filename}`;
        
        next();
      } catch (error) {
        return next(new AppError('Error processing image', 500));
      }
    });
  };
};

// Middleware to process and save multiple images
const uploadImages = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMultiple = upload.array(fieldName, maxCount);

    uploadMultiple(req, res, async (err) => {
      if (err) {
        return next(new AppError(err.message, 400));
      }

      if (!req.files || req.files.length === 0) return next();

      try {
        // Process each image
        const processedFiles = await Promise.all(
          req.files.map(async (file, index) => {
            const filename = `${fieldName}-${Date.now()}-${index + 1}.jpeg`;
            const filepath = path.join(uploadDir, filename);

            await sharp(file.buffer)
              .resize(800, 600, {
                fit: 'cover',
                position: 'center',
              })
              .toFormat('jpeg')
              .jpeg({ quality: 85 })
              .toFile(filepath);

            return {
              filename,
              path: `/uploads/${filename}`,
              mimetype: 'image/jpeg',
            };
          })
        );

        // Save the processed files to the request object
        req.files = processedFiles;
        next();
      } catch (error) {
        return next(new AppError('Error processing images', 500));
      }
    });
  };
};

// Delete file from the filesystem
const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // Ignore file not found error
        console.error(`Error deleting file ${filename}:`, err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteFile,
};
