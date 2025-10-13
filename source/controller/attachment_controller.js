const { Attachment, User, Ticket } = require("../models/index");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const uploadAttachment = async (req, res) => {
  try {
    const { ticket_id, last_comment } = req.body;
    const user_id = 13;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Check if ticket exists
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found",
      });
    }

    const attachment = await Attachment.create({
      ticket_id,
      file_url: req.file.filename,
      last_comment,
      user_id,
    });

    const fullAttachment = await Attachment.findByPk(attachment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    res.status(201).json({
      message: "File uploaded successfully",
      attachment: fullAttachment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAttachments = async (req, res) => {
  try {
    const { ticket_id } = req.params;

    const attachments = await Attachment.findAll({
      where: { ticket_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    if (!attachments) {
      return res.status(404).json({
        success: false,
        error: "Ticket not found",
      });
    }
    res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const fileSome = path.resolve(__dirname, "../../");
    const filePath = path.join(fileSome, uploadDir, filename);
    console.log(__dirname);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set appropriate headers
    const stat = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Set content type berdasarkan ekstensi file
    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    // Stream file ke response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving file",
      error: error.message,
    });
  }
};
module.exports = { uploadAttachment, getAttachments, upload, downloadFile };
