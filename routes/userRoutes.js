const express = require("express")
const router = express.Router();
const multer = require("multer")
const {renderLogin,renderRegister,registerUser,profileSetup,login,renderHome,logout,viewProfile,updateProfile,verifyOtp} = require ("../controller/userController")
const path = require("path")
const {authentication} = require("../middleware/authentication")



// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
    
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return (new Error("Only JPEG and PNG images are allowed!"), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });



// Configure Multer Storage
const storages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads"); // Save images in 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});
const Upload = multer({ dest: "public/uploads" }); 



  

 
router.get("/",authentication,renderHome)
router.get("/login",renderLogin)
router.get("/register",renderRegister)
router.post("/register",registerUser)
router.post("/profileSetup/:id",Upload.single("image"),profileSetup)
router.post("/login",login)
router.get("/logout",logout)
router.get("/viewProfile/:id",authentication,viewProfile)
router.post("/updateProfile",Upload.single("image"),authentication,updateProfile)
router.post("/verifyOtp/:id",verifyOtp)

  
module.exports = router 
