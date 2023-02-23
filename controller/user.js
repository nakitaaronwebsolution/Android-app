const { userModel, attendanceModel, leaveModel, academicModel, imageModel } = require('../model/index');
const jwt = require("jsonwebtoken")
const { successResponse, faildResponse, validateRequest, securePassword, comparePassword } = require("../helper/helper");
const mongoose = require("mongoose")

var Secret_Key =  process.env.Secret_Key
 var Publishable_Key = process.env.Publishable_Key
const stripe = require('stripe')(Secret_Key)
const otpGenerator = require('otp-generator')
const nodemailer = require("nodemailer")
const Joi = require("joi");
const { validateSignup, validatelogin } = require("../helper/validate");
const { version } = require('joi');
module.exports = {
  async register(req, res) {
    try {
      const { username, role, password, contact_number, email, retype_password, date_of_birth, father_name, mother_name, Adhar_number, gender, blood_group, address } = req.body
      const { error } = validateSignup({ username, password, contact_number, email, role, retype_password, date_of_birth, father_name, mother_name, Adhar_number, blood_group, gender, address });
      if (error) {
        console.log(error);
        return res.send(faildResponse({ meassage: error.message }));
      }
      const hash = await securePassword(password)
      const usernameExist = await userModel.findOne({ username: username })
      if (usernameExist) {
        return res.send(faildResponse("username Already Exist!"))
      }
      const Email = await userModel.findOne({ email: email })
      if (Email) {
        return res.send(faildResponse("Email Already Exist!"))
      }
      userModel.create({
        username: username,
        password: hash,
        email: email,
        retype_password: hash,
        date_of_birth: date_of_birth,
        father_name: father_name,
        mother_name: mother_name,
        Adhar_number: Adhar_number,
        contact_number: contact_number,
        gender: gender,
        role: role,
        address: address,
        blood_group: blood_group,
        status: true
      }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          console.log(result)
          return res.send(successResponse("user create Successfully", result))
        }
      })
    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
  async userLogin(req, res) {
    try {
      const { username, password } = req.body
      const { error } = validatelogin({ username, password });
      if (error) {
        console.log(error);
        return res.send(faildResponse({ meassage: error.message }));
      }
      const result = await userModel.findOne({ username: username })
      if (!result) {
        return res.status(404).send("something went wrong")
      } else {
        if (result) {
          console.log(result)
          const compassword = await comparePassword(password, result.password);
          if (!compassword) {
            return res.send(faildResponse("password is wrong"))
          }
          else {
            const token = jwt.sign({
              id: result._id,
              username: username
            }, process.env.TOKEN_SECRET, { expiresIn: "7d" })
            console.log(token, "token______________")
            let newUser = await userModel.findOneAndUpdate({ username: username }, { token: token }, { new: true })

            return res.send(successResponse("login successfully", { token: token, user: newUser }))
          }
        } else {
          return res.send(faildResponse("Invalid Cred"))
        }
      }

    } catch (error) {
      console.log(error)
      return res.send(faildResponse(error))
    }

  },
  async update_user(req, res) {
    try {
      const tokenUser = req.decode
      const { username, mobile_number, email } = req.body
      let validate = validateRequest(req.body, ['username', 'email', 'mobile_number'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      userModel.findOneAndUpdate({ _id: tokenUser._id }, {
        username: username,
        email: email,
        mobile_number: mobile_number,
      }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse(" update user Successfully", result))
        }
      })
    } catch (error) {
      return res.send(faildResponse(error))
    }
  },
  async delete_user(req, res) {
    try {
      const tokenUser = req.decode
      userModel.findOneAndDelete({ _id: tokenUser._id }, { new: true }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          return res.send(successResponse(" delete user Successfully", {}))
        }
      })
    } catch (error) {
      return res.send(faildResponse(err))
    }
  },
  async forgotPassword(req, res) {
    try {
      const { email } = req.body
      let validate = validateRequest(req.body, ['email'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({ email: email })
      if (!userExist) {
        return res.send(faildResponse("user not exist"))
      }
      const OTP = otpGenerator.generate(6, {
        alphabets: false, specialChars: false, digits: true,
        lowerCaseAlphabets: false, upperCaseAlphabets: false,
      });

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nakitaaronwebsolutions@gmail.com",
          pass: "wslfwyqhiekvzpvj",
        },
      });

      var mailOptions = {
        from: "nakitaaronwebsolutions@gmail.com",
        to: email,
        subject: "Password Reset",
        html: `<h1>AWS Solutions</h1> </br> <p>Your OTP is: ${OTP}</p>`
        // text :OTP
      };
      // const otp = await securePassword(OTP)
      console.log(OTP)
      await userModel.findOneAndUpdate({ _id: userExist._id }, { otp: OTP }, { new: true })
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {

          console.log("Email error sent: " + JSON.stringify(error));
          return res.send(faildResponse(error));
        } else {

          console.log("Email result sent: " + JSON.stringify(result));
          return res.send(successResponse("send mail successfully ", result))
        }
      });

    } catch (error) {
      console.log("err=====", error)
      return res.send(faildResponse(error))
    }
  },
  async verifyOtp(req, res) {
    try {
      const { otp } = req.body
      let validate = validateRequest(req.body, ['otp'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({ otp: otp })
      if (!userExist) {
        return res.send(faildResponse("wrong otp"))
      }
      console.log(userExist)
      if (userExist) {
        const deleteotp = await userModel.findOneAndUpdate({ _id: userExist._id }, { otp: "" }, { new: true })
        console.log(deleteotp)
        if (deleteotp) {
          return res.send(successResponse("verify otp seccess"))
        }
      }
    } catch (e) {
      console.log("err===", e)
      return res.send(faildResponse(e))
    }
  },
  async resetPassword(req, res) {
    try {
      const tokenUser = req.decode
      const { newPassword, confirmPassword } = req.body
      let validate = validateRequest(req.body, ['newPassword', 'confirmPassword'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      if (newPassword !== confirmPassword) {
        return res.send(faildResponse("password is not match"));
      }
      const hash = await securePassword(confirmPassword)

      const data = await userModel.findOneAndUpdate({ _id: tokenUser._id }, { password: hash, retype_password: hash }, { new: true })
      if (!data) {
        return res.send(faildResponse("something went wrong"));
      } else {

        return res.send(successResponse("Reset  password successfully", data));
      }
    } catch (error) {
      console.log("err=====", error)
      return res.send(faildResponse(error))
    }
  },
  async checkInAttendance(req, res) {
    try {
      const { userId, present } = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId"))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist "))
      }
      const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      // const getDay = todatyData.getDay()
      const getMonth = todatyData.getMonth() + 1
      const getFullYear = todatyData.getFullYear()
      const isLeap = (year) => new Date(year, 1, 29).getDate() == 29;
      if (isLeap(getFullYear)) {
        days[2] = 29;
      }
      const total = days[todatyData.getMonth() + 1];
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      console.log(total)
      let findQuerry = {
        user: userId,
        date: toDay
      }

      let updateQuerry = {
        cretatedBy: req.decode._id,
        user: userId,
        date: toDay,
        totalDay: total,
        present: present,
        status: true
      }
      attendanceModel.findOneAndUpdate(findQuerry, updateQuerry, { new: true, upsert: true }, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong "))
        }
        if (result) {
          return res.send(successResponse("Check In Success", result))
        }
      })
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },
  async getAttendances(req, res) {
    try {
      const { userId } = req.body
      let validate = validateRequest(req.body, ['userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      var validUser = mongoose.Types.ObjectId.isValid(userId);
      if (validUser == false) {
        return res.send(faildResponse("invalid userId."))
      }
      const userExist = await userModel.findOne({ _id: userId })
      if (!userExist) {
        return res.send(faildResponse("user not exist"))
      }
      const attendance = await attendanceModel.find({ user: userExist._id, present: true }).select("present totalDay")
      if (!attendance) {
        return res.send(faildResponse("attendance not exist"))
      }
      console.log(attendance.length)
      const presentcount = attendance.length
      // let TOTAL=0;
      const openDay = attendance.map((el, i) => el.totalDay)
      // console.log( Number(openDay.join("")));
     const update = await attendanceModel.updateMany({ user: userExist._id }, { $set: { presentcount: presentcount, absentcount: Number(openDay.join("")) - presentcount } }, { new: true }, )
     attendanceModel.find({},async function (err, result) {
        if (err) {
          console.log(err);
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          console.log(result)
          return res.send(successResponse("Attendances In Success", result))
        }
      }).select("totalDay absentcount presentcount")
    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
    }
  },

  async academicCreate(req, res) {
    try {
      const { course, Class, section, roll_number, admission_number, userId } = req.body
      let validate = validateRequest(req.body, ['course', 'Class', 'section', 'roll_number', 'admission_number', 'userId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      academicModel.create({
        course: course,
        Class: Class,
        section: section,
        roll_number: roll_number,
        admission_number: admission_number,
        userId: userId
      }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          console.log(result)
          return res.send(successResponse("academic details Create Successfully", result))
        }
      })
    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
  async getacademic_details(req, res) {
    try {
      const { academicId } = req.body
      let validate = validateRequest(req.body, ['academicId'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      academicModel.findOne({ _id: academicId }, function (err, result) {
        if (err) {
          return res.send(faildResponse(err))
        }
        else {
          console.log(result)
          return res.send(successResponse("academic details get Successfully", result))
        }
      }).populate("userId", "username father_name mother_name gender blood_group date_of_birth contact_number Adhar_number address ")
    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
 async payment(req,res){
  try{
    const userExist = await userModel.findOne({email:req.body.stripeEmail})
    stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: 'Gourav Hammad',
      address: {
        line1: 'TC 9/4 Old MES colony',
        postal_code: '452331',
        city: 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
      }
    })
    .then((customer) => {

      return stripe.charges.create({
        amount: 2500,	 // Charging Rs 25
        description: 'Web Development Product',
        currency: 'INR',
        customer: customer.id
      });
    })
    .then((charge) => {
      res.send("Success") // If no error occurs
    })
    .catch((err) => {
      res.send(err)	 // If some error occurs
    });
  }catch(e){
    console.log("errr========",e)
    return res.send(faildResponse(e))
  }
 },
 async upload_image(req,res){
  try{
    let image = null;
    if (req.file) image = 'http://localhost:4002/images/' + req.file.filename
    let result = await imageModel.create({ image: image })
    if (!result) {
      return res.send(faildResponse("this User is Not exist"));
    } else {
      return res.send(successResponse("image upload successfully", result));
    }
  }catch(e){
    return res.send(faildResponse(e))
  }
 }
}