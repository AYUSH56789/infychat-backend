const multer  = require('multer')
const fs  = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'E:/minor/backend/files/uploads'; // Update the destination path
        // Create the destination directory if it doesn't exist
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name + Date.now()+ Math.round(Math.random() * 1E9));
    }
});

const attachmentsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'E:/minor/backend/files/attachments'; // Update the destination path
        // Create the destination directory if it doesn't exist
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+ file.originalname );
    }
});

// filter file type
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.match(/jpg|jpeg|png/)) {
      cb(new Error('File is not supported'), false);
      return;
    }
    cb(null, true);
  };

// filter file type
const attachmentsFileFilter = (req, file, cb) => {
    if (!file.mimetype.match(/jpg|jpeg|png|pdf/)) {
      cb(new Error('File is not supported'), false);
      return;
    }
    cb(null, true);
  };

const upload = multer({ storage: storage ,fileFilter});

const attachments= multer({storage: attachmentsStorage })

module.exports={
    upload, attachments
}