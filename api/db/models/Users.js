const mongoose = require("mongoose");

const schema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
}, {
    timestamps: true
});

class Users extends mongoose.Model {

}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);