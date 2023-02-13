const { userModel, bookModel } = require('../model/index');

const { successResponse, faildResponse, validateRequest } = require("../helper/helper");
const mongoose = require("mongoose")
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
    }
}