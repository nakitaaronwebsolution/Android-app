const { userModel, academicModel, bookModel, pdfModel, examModel, resultModel } = require('../model/index');

const { successResponse, faildResponse, validateRequest } = require("../helper/helper");
const mongoose = require("mongoose");
const { number } = require('joi');

module.exports = {
    async createbook(req, res) {
        try {
            const { title, price } = req.body
            let validate = validateRequest(req.body, ['title', 'price'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            let image = null;
            if (req.file) image = 'http://localhost:4002/images/' + req.file.filename
            const result = await bookModel.create({
                title: title,
                price: price,
                image: image,
                status: true
            })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("book create successfully", result))
            }
        } catch (err) {
            console.log("errr=====", err)
            return res.send(faildResponse(err))
        }
    },
    async getbooks(req, res) {
        try {
            let data = req.body
            let validate = validateRequest(req.body, ['shortBy', 'page', 'size', 'order'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            let bookCount = await bookModel.aggregate([
                { $group: { _id: null, myCount: { $sum: 1 } } }
            ])
            const result = await bookModel.aggregate([
                { $skip: ((Number(data.page) - 1) * Number(data.size)) },
                { $sort: { [`${data.shortBy}`]: Number(data.order) } }
            ])

            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("book get successfully", result, bookCount[0].myCount))
            }
        } catch (err) {
            console.log("errr=====", err)
            return res.send(faildResponse(err))
        }
    },
    async update_book(req, res) {
        try {
            const { bookId, title, price } = req.body
            let validate = validateRequest(req.body, ['bookId'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)

            const bookExist = await bookModel.findOne({ _id: bookId })
            if (!bookExist) {
                return res.send(faildResponse("book not exist"))
            }
            if (title == "" || price == "") {
                return res.send(faildResponse("required the data"))
            }
            const result = await bookModel.findOneAndUpdate({ _id: bookExist._id }, { title: title, price: price }, { new: true })
            if (!result) {
                return res.send(faildResponse("sommeething went wrong"))
            } else {
                return res.send(successResponse("book update success", result))
            }
        } catch (err) {
            console.log("err===")
            return res.send(faildResponse(err))
        }
    },
    async updatebook_image(req, res) {
        try {
            const { bookId } = req.body
            let validate = validateRequest(req.body, ['bookId'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            let image = null;
            if (req.file) image = 'http://localhost:4003/images/' + req.file.filename
            const bookExist = await bookModel.findOne({ _id: bookId })
            if (!bookExist) {
                return res.send(faildResponse("book not exist"))
            }
            const result = await bookModel.findOneAndUpdate({ _id: bookExist._id }, { image: image }, { new: true })
            if (!result) {
                return res.send(faildResponse("sommeething went wrong"))
            } else {
                return res.send(successResponse("image update success", result))
            }
        } catch (err) {
            console.log("err===")
            return res.send(faildResponse(err))
        }
    },
    async delete_book(req, res) {
        try {
            const { bookId } = req.body
            let validate = validateRequest(req.body, ['bookId'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            const bookExist = await bookModel.findOne({ _id: bookId })
            if (!bookExist) {
                return res.send(faildResponse("book not exist"))
            }
            const result = await bookModel.deleteOne({ _id: bookExist._id })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("book delete success", {}))
            }
        } catch (err) {
            console.log("er====", err)
            return res.send(faildResponse(err))
        }
    },
    async upload_pdf(req, res) {
        try {
            const { Class } = req.body
            let pdf = null;
            if (req.file) pdf = 'http://localhost:4002/pdfs/' + req.file.filename
            const result = await pdfModel.create({
                pdf: pdf,
                Class: Class

            })
            if (!result) {
                console.log(result)
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("pdf upload successfully", result))
            }
        } catch (e) {
            console.log("err=====", e)
            return res.send(faildResponse(e))
        }
    },
    async get_pdf(req, res) {
        try {
            const { Class } = req.body
            let validate = validateRequest(req.body, ['Class'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            const ClassExist = await academicModel.findOne({ Class: Class })
            if (!ClassExist) {
                return res.send(faildResponse("Class not exist"))
            }
            const result = await pdfModel.find({ Class: Class })
            if (!result) {
                return res.send(faildResponse("class not same"))
            } else {
                return res.send(successResponse("pdf get success", result))
            }
        } catch (e) {
            console.log("er====", err)
            return res.send(faildResponse(e))
        }
    },
    async examcreate(req, res) {
        try {
            const { Class, date, subject, room_number } = req.body
            let validate = validateRequest(req.body, ['Class', 'subject', 'room_number', 'date'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            const classExist = await academicModel.find({ Class: Class })
            if (!classExist) {
                return res.send(faildResponse("class not exist"))
            }
            const result = await examModel.create({
                Class: Class, date: date, subject: subject, room_number: room_number
            })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("exam create successfully", result))
            }
        } catch (er) {
            console.log("er=======", er)
            return res.send(faildResponse(er))
        }
    },
    async examget(req, res) {
        try {
            const result = await examModel.find({}).sort({ Class: 1 })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("exam get successfully", result))
            }
        } catch (err) {
            console.log("errr====", err)
            return res.send(faildResponse(err))
        }
    },
    async create_result(req, res) {
        try {
            const {  marks,subjectId,total,userId } = req.body
            let validate = validateRequest(req.body, ['marks', 'subjectId', 'total','userId'])
            if (validate && !validate.status && validate.msg) return res.send(faildResponse(validate.msg))
            console.log(validate.msg)
            const classExist = await examModel.findOne({ _id: subjectId })
            if (!classExist) {
                return res.send(faildResponse("subject not exist"))
            }
            const userExist = await userModel.findOne({ _id: userId })
            if (!userExist) {
                return res.send(faildResponse("user not exist"))
            }
            const resultExist = await resultModel.findOne({
               subjectId:classExist,userId:userExist
            })
            if(resultExist){
                return res.send(faildResponse("result already Exist"))  
            }
            const result = await resultModel.create({
                marks,subjectId:classExist,total,userId:userExist
            })
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("result create successfully", result))
            }
        } catch (er) {
            console.log("er=======", er)
            return res.send(faildResponse(er))
        }
    },
    //*********************************************************************************************** */
    async get_result(req, res) {
        try {
            const result = await resultModel.find({}).populate("userId", "username").populate("subjectId","Class subject")
            if (!result) {
                return res.send(faildResponse("something went wrong"))
            } else {
                return res.send(successResponse("result get successfully", result))
            }
        } catch (er) {
            console.log("er=======", er)
            return res.send(faildResponse(er))
        }
    },
}


