const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
    Class:{ type: String, require: true, default: "" },
    subject:{ type: String, require: true, default: "" },
    date: { type: String, require: true, default: "" },
    room_number:{ type: String, require: true, default: "" },
    cretatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, {
    timestamps: true
});

module.exports = mongoose.model('exam', examSchema);