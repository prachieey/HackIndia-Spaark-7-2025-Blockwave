const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const AppError = require('./appError');

// Ensure the qr-codes directory exists
const qrCodeDir = path.join(__dirname, '../../public/qr-codes');

(async () => {
  try {
    await fs.mkdir(qrCodeDir, { recursive: true });
  } catch (err) {
    console.error('Error creating qr-codes directory:', err);
  }
})();

/**
 * Generate a QR code for a ticket
 * @param {string} ticketId - The ID of the ticket
 * @param {string} eventId - The ID of the event
 * @returns {Promise<{qrCodePath: string, qrCodeUrl: string}>} - Path and URL of the generated QR code
 */
const generateQRCode = async (ticketId, eventId) => {
  try {
    // Create a unique filename for the QR code
    const filename = `ticket-${ticketId}-${Date.now()}.png`;
    const filePath = path.join(qrCodeDir, filename);
    
    // Data to encode in the QR code
    const data = JSON.stringify({
      ticketId,
      eventId,
      timestamp: Date.now(),
    });

    // Generate QR code and save to file
    await QRCode.toFile(filePath, data, {
      color: {
        dark: '#000000',  // Black dots
        light: '#ffffff00' // Transparent background
      },
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H' // High error correction
    });

    // Return the path and URL
    return {
      qrCodePath: filePath,
      qrCodeUrl: `/qr-codes/${filename}`
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new AppError('Error generating QR code', 500);
  }
};

/**
 * Delete a QR code file
 * @param {string} qrCodeUrl - The URL of the QR code to delete
 * @returns {Promise<void>}
 */
const deleteQRCode = async (qrCodeUrl) => {
  try {
    if (!qrCodeUrl) return;
    
    // Extract the filename from the URL
    const filename = path.basename(qrCodeUrl);
    const filePath = path.join(qrCodeDir, filename);
    
    // Delete the file if it exists
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore file not found errors
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  } catch (error) {
    console.error('Error deleting QR code:', error);
    // Don't throw the error to avoid failing the main operation
  }
};

/**
 * Generate a QR code data URL (for in-memory usage)
 * @param {string} data - The data to encode in the QR code
 * @returns {Promise<string>} - Data URL of the generated QR code
 */
const generateQRCodeDataURL = async (data) => {
  try {
    return await QRCode.toDataURL(data, {
      color: {
        dark: '#000000',
        light: '#ffffff00'
      },
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw new AppError('Error generating QR code', 500);
  }
};

module.exports = {
  generateQRCode,
  deleteQRCode,
  generateQRCodeDataURL,
};
