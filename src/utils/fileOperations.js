const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const AppError = require('./appError');

// Base upload directory
const uploadsDir = path.join(__dirname, '../../public/uploads');

// Ensure upload directories exist
const ensureDirectories = async () => {
  const directories = [
    uploadsDir,
    path.join(uploadsDir, 'events'),
    path.join(uploadsDir, 'users'),
    path.join(uploadsDir, 'tickets')
  ];

  try {
    await Promise.all(
      directories.map(dir => 
        fs.mkdir(dir, { recursive: true })
      )
    );
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw new AppError('Error setting up file storage', 500);
  }
};

// Process and save an image
const processAndSaveImage = async (file, options = {}) => {
  const {
    width = 1200,
    height = 800,
    quality = 90,
    format = 'jpeg',
    subfolder = 'misc'
  } = options;

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${subfolder}-${timestamp}-${Math.round(Math.random() * 1e9)}.${format}`;
    const filePath = path.join(uploadsDir, subfolder, filename);
    const publicPath = `/uploads/${subfolder}/${filename}`;

    // Process the image
    await sharp(file.buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .toFormat(format, { quality })
      .toFile(filePath);

    return {
      filename,
      path: filePath,
      publicPath,
      mimetype: `image/${format}`,
      size: (await fs.stat(filePath)).size
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new AppError('Error processing image', 500);
  }
};

// Delete a file
const deleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    // Extract the filename from URL if it's a full URL
    let actualPath = filePath;
    if (filePath.startsWith('/uploads/')) {
      actualPath = path.join(__dirname, '../../public', filePath);
    }

    await fs.unlink(actualPath);
  } catch (error) {
    // Ignore file not found errors
    if (error.code !== 'ENOENT') {
      console.error('Error deleting file:', error);
      throw new AppError('Error deleting file', 500);
    }
  }
};

// Delete multiple files
const deleteFiles = async (filePaths) => {
  if (!filePaths || !Array.isArray(filePaths)) return;
  
  try {
    await Promise.all(filePaths.map(filePath => deleteFile(filePath)));
  } catch (error) {
    console.error('Error deleting files:', error);
    throw new AppError('Error deleting files', 500);
  }
};

// Generate a file URL
const generateFileUrl = (req, filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  
  const protocol = req.secure ? 'https' : 'http';
  const host = req.get('host');
  
  // Remove leading slash if present to prevent double slashes
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  return `${protocol}://${host}/${cleanPath}`;
};

// Validate file type
const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
  if (!file || !file.mimetype) {
    throw new AppError('No file provided', 400);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
  }

  return true;
};

// Validate file size
const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSize = maxSizeInMB * 1024 * 1024; // Convert MB to bytes
  
  if (file.size > maxSize) {
    throw new AppError(`File is too large. Maximum size is ${maxSizeInMB}MB`, 400);
  }

  return true;
};

module.exports = {
  ensureDirectories,
  processAndSaveImage,
  deleteFile,
  deleteFiles,
  generateFileUrl,
  validateFileType,
  validateFileSize,
  uploadsDir
};
