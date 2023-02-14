const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
    Class :{type : String,required : true, default: "" },
 pdf :{type : String,required : true, default: "" },

}, {
    timestamps: true
});

module.exports = mongoose.model("pdf", pdfSchema);