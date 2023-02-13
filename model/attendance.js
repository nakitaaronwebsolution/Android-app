const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({
    cretatedBy:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: String },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('attendance', AttendanceSchema);