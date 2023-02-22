const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
    marks:{ type: String, require: true, default: "" },
    subjectId:{ type:mongoose.Schema.Types.ObjectId, ref: 'exam' },
    total: { type: String, require: true, default: "" },
    userId:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

module.exports = mongoose.model('result', resultSchema);