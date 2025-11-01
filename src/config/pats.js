const path = require("path");

class PathConfig {
  constructor() {
    // Get project root directory (naik 2 level dari src/config/)
    this.projectRoot = path.resolve(__dirname, "../../");
    this.setupPaths();
  }

  setupPaths() {
    this.paths = {
      // Project directories
      root: this.projectRoot,
      src: path.join(this.projectRoot, "src"),

      // Upload directories
      uploads: path.join(this.projectRoot, "uploads"),
      uploadsImages: path.join(this.projectRoot, "uploads", "images"),
      uploadsDocuments: path.join(this.projectRoot, "uploads", "documents"),
      uploadsAvatars: path.join(this.projectRoot, "uploads", "avatars"),
      uploadsTemp: path.join(this.projectRoot, "uploads", "temp"),

      // Storage directories
      storage: path.join(this.projectRoot, "storage"),
      storageLogs: path.join(this.projectRoot, "storage", "logs"),
      storageCache: path.join(this.projectRoot, "storage", "cache"),

      // Public directories
      public: path.join(this.projectRoot, "public"),
      publicImages: path.join(this.projectRoot, "public", "images"),
    };
  }

  // Get specific path
  get(pathName) {
    return this.paths[pathName] || this.projectRoot;
  }

  // Get uploads path with optional subdirectory
  getUploadsPath(subdir = "") {
    if (subdir) {
      return path.join(this.paths.uploads, subdir);
    }
    return this.paths.uploads;
  }

  // Get relative path from current file to uploads
  getRelativeToUploads(currentFile) {
    const currentDir = path.dirname(currentFile);
    return path.relative(currentDir, this.paths.uploads);
  }

  // Validate if path is within uploads directory
  isWithinUploads(filePath) {
    const resolved = path.resolve(filePath);
    const uploadsResolved = path.resolve(this.paths.uploads);
    return resolved.startsWith(uploadsResolved);
  }
}

module.exports = new PathConfig();
