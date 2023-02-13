const mongoose = require('mongoose');

const academicSchema = mongoose.Schema({
    course:{ type: String, require: true, default: "" },
    Class: { type: String, require: true , default: "" },
    section: { type: String,require: true , default: "" },
    roll_number:{ type: String,require: true , default: ""  },
    admission_number:{ type: String, require: true , default: "" },
    userId:{ type:mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, {
    timestamps: true
});

module.exports = mongoose.model('academic', academicSchema);