const { userModel, attendanceModel, leaveModel, academicModel } = require('../model/index');
const jwt = require("jsonwebtoken")
const { successResponse, faildResponse, validateRequest, securePassword, comparePassword } = require("../helper/helper");
const mongoose = require("mongoose")

const otpGenerator = require('otp-generator')
const nodemailer = require("nodemailer")
const Joi = require("joi");
const { validateSignup, validatelogin } = require("../helper/validate");
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
        return res.send(faildResponse("something went wrong"))
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
      const link = `http://localhost:3000/reset-password/${OTP}`
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nakitaaronwebsolutions@gmail.com",
          pass: "wslfwyqhiekvzpvj",
        },
      });
      let emailHtml = `
<!doctype html>
<html lang="en-US">
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #F2F3F8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#F2F3F8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #F2F3F8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #CECECE; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            This is A unique link to reset your
                                            password. To reset your password, click the
                                            following link.
                                        </p>
                                        <a href="${link}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>
</html>`
      var mailOptions = {
        from: "nakitaaronwebsolutions@gmail.com",
        to: email,
        subject: "Password Reset",
        html: emailHtml,
      };
      const otp = await securePassword(OTP)

      await userModel.findOneAndUpdate({ _id: userExist._id }, { otp: otp }, { new: true })
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {

          console.log("Email error sent: " + JSON.stringify(error));
          return res.send(faildResponse(error));
        } else {

          console.log("Email result sent: " + JSON.stringify(result));
          return res.send(successResponse("send mail successfully ", result))
        }
      });
      console.log(link);
    } catch (error) {
      console.log("err=====", error)
      return res.send(faildResponse(error))
    }
  },
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body
      let validate = validateRequest(req.body, ['otp', 'email'])
      if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
      console.log(validate.msg)
      const userExist = await userModel.findOne({ email: email })
      if (!userExist) {
        return res.send(faildResponse("user not found"))
      }
      const OTP = await comparePassword(otp, userExist.otp);

      if (!OTP) {
        return res.send(faildResponse("wrong otp"))
      }
      if (OTP) {
        const deleteotp = await userModel.findOneAndUpdate({ _id: userExist._id }, { otp: "" }, { new: true })
        if (deleteotp) {
          return res.send(successResponse("verify otp seccess"))
        }
        // else{
        //    var set = setTimeout(expireOtp, 4000)
        //   console.log("=========")
        //   function expireOtp() {
        //     console.log("hello")
        //     const exOtp = userModel.findOneAndUpdate({ _id: userExist._id }, { otp: "" }, { new: true })
        //     if (exOtp) {
        //       return res.send(faildResponse("expire otp"))
        //     }
        // }
        // }
      }

    } catch (err) {
      console.log("err=====", err)
      return res.send(faildResponse(err))
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
      const { userId, present, absent } = req.body
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
      let todatyData = new Date()
      const getDate = todatyData.getDate()
      const getMonth = todatyData.getMonth()
      const getFullYear = todatyData.getFullYear()
      const toDay = `${getDate}/${getMonth}/${getFullYear}`
      let findQuerry = {
        user: userId,
        date: toDay
      }
      let updateQuerry = {
        cretatedBy: req.decode._id,
        user: userId,
        absent: absent,
        checkInTime: todatyData,
        date: toDay,
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
      let findQuerry = {
        user: userId
      }
      attendanceModel.find(findQuerry, async function (err, result) {
        if (err) {
          return res.send(faildResponse("Something went wrong while Update team Member."))
        }
        if (result) {
          return res.send(successResponse("Attendances In Success", result))
        }
      })
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
      }).populate("userId","username father_name mother_name gender blood_group date_of_birth contact_number Adhar_number address ")    } catch (error) {
      console.log("err====", error)
      return res.send(faildResponse(error))
    }
  },
}