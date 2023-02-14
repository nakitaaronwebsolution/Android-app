const { string } = require('joi');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username:{ type: String, require: true, default: "" },
    email: { type: String, require: true , default: "" },
    date_of_birth:{type: String, require: true, default: ""  },
    gender: {type : String,enum : ["female","male"],required: true},
    father_name:{ type: String, require: true, default: ""  },
    mother_name:{ type: String, require: true, default: ""  },
    password: { type: String, require: true , default: "" },
    contact_number: { type: String, require: true, default: ""  },
    Adhar_number:{ type: String, require: true, default: ""  },
    role:{type : String,enum : ["admin","user"],required: true},
    blood_group:{ type: String, require: true, default: ""  },
    retype_password : { type: String, require: true , default: "" },
    address:{ type: String, require: true, default: ""  },
    otp:{ type: String},
    token:{ type: String},
    status :{type :String,require:true, default:false}
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);