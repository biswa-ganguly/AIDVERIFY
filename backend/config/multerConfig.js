import multer from "multer";

// Store uploaded files in memory (not on disk)
const storage = multer.memoryStorage();

const upload = multer({ storage });
export default upload;
