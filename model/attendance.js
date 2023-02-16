const { string } = require('joi');
const mongoose = require('mongoose');

const AttendanceSchema = mongoose.Schema({
    cretatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: String },
    present: { type: Boolean, default: false },
    totalDay: { type: Number, default: 0 },
    presentcount: { type: Number, default: 0 },
    absentcount: { type: Number, default: 0 },
    status: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('attendance', AttendanceSchema);