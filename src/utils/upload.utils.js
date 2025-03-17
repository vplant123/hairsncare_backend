const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');


cloudinary.config({
    cloud_name: "drkpwvnun",
    api_key: "692814272862656",
    api_secret: "qrGHTQqUICbzjuf00fTH33TRODU"
});
console.log("key", process.env.CLOUDINARY_API_KEY)


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname+"/public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})



// const uploadImageToCloudinary = (file) => {
//     return new Promise((resolve, reject) => {
//         cloudinary.uploader.upload(file.path, { folder: 'hair-assessment' }, (error, result) => {

//             fs.unlink(file.path, (err) => {
//                 if (err) {
//                     console.error('Error deleting file:', err);
//                 }
//             });

//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(result.secure_url);
//             }
//         });
//     });
// };
const uploadImageToCloudinary = (file) => {
    console.log("kzeokrwe",file?.filename)
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, { folder: 'hair-assessment',
            use_filename: true,
            unique_filename: false,
            public_id: file?.filename || Date.now()   
         }, (error, result) => {
            // Check for errors during upload
            if (error) {
                // Reject the promise with the upload error
                reject(error);
            } else {
                // Resolve the promise with the secure URL
                resolve(result.secure_url);
            }

            // Regardless of upload success or failure, delete the file
            fs.unlink(file.path, (err) => {
                if (err) {
                    // Log error if deletion fails, but don't reject the promise
                    console.error('Error deleting file:', err);
                }
            });
        });
    });
};



module.exports = { upload, uploadImageToCloudinary };
