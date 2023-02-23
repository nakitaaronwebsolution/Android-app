const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    image :{type : String,required : true, default: "" },
}, {
    timestamps: true
});

module.exports = mongoose.model("image", imageSchema);