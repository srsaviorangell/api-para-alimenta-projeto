const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Memory storage — we process the buffer with jimp
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB raw limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Apenas imagens JPEG, PNG, WebP ou GIF são permitidas.'));
    }
});

async function processAndSaveImage(buffer, eventId) {
    const dir = path.join(__dirname, '../../uploads/events', eventId);
    fs.mkdirSync(dir, { recursive: true });
    const outputPath = path.join(dir, 'image.jpg'); // jimp outputs JPEG

    try {
        const Jimp = require('jimp');
        const image = await Jimp.read(buffer);
        // Resize to max 800px width, keep aspect ratio
        if (image.getWidth() > 800) {
            image.resize(800, Jimp.AUTO);
        }
        // Save with 80% JPEG quality
        await image.quality(80).writeAsync(outputPath);

        // Check size — if > 500KB, reduce further
        const stats = fs.statSync(outputPath);
        if (stats.size > 500 * 1024) {
            await image.quality(60).writeAsync(outputPath);
        }

        return `/uploads/events/${eventId}/image.jpg`;
    } catch (e) {
        // Fallback: just save the raw buffer
        fs.writeFileSync(outputPath, buffer);
        return `/uploads/events/${eventId}/image.jpg`;
    }
}

module.exports = { upload, processAndSaveImage };
