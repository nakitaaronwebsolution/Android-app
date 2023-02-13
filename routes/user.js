const express = require("express")
const router = express.Router()

const userController = require("../controller/user")
const bookController = require("../controller/book")
const middleware = require("../helper/validateMiddleware")
const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
  })
  const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
      },
  })
router.post("/register",userController.register)
router.post("/login",userController.userLogin)
router.post("/forgotPassword",userController.forgotPassword)
router.post("/verifyOtp",userController.verifyOtp)
router.post("/update_user",middleware.validateUser,userController.update_user)
router.post("/delete_user",middleware.validateUser,userController.delete_user)
router.post("/reset_password",middleware.validateUser,userController.resetPassword)

router.post('/checkInAttendance',middleware.validateUser,userController.checkInAttendance);
router.post('/getAttendances',middleware.validateUser, userController.getAttendances);

router.post('/createbook',middleware.validateUser,upload.single("image"), bookController.createbook);
router.post('/getbooks',middleware.validateUser, bookController.getbooks);
router.post('/update_book',middleware.validateUser, bookController.update_book);
router.post('/updatebook_image',middleware.validateUser,upload.single("image"), bookController.updatebook_image);
router.post('/delete_book',middleware.validateUser, bookController.delete_book);

router.post('/requestLeave',middleware.validateUser,userController.requestLeave);
router.post('/update_Leave',middleware.validateUser,userController.update_Leave);

router.post("/academicCreate",middleware.validateAdmin,userController.academicCreate)
router.post("/getacademic_details",middleware.validateAdmin,userController.getacademic_details)

module.exports=router