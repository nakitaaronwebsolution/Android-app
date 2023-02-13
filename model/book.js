const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
 title :{type : String,required : true, default: "" },
 image :{type : String,required : true, default: "" },
 price :{type : String,required : true, default: "" },
 issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 quantity :{type : String,required : true, default: "1" },
status :{type : String, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model("book", bookSchema);

