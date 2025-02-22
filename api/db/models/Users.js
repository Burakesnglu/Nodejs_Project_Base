const mongoose = require("mongoose");
const is = require("is_js");
const { PASS_LENGTH, HTTP_CODES } = require("../../config/Enum");
const CustomError = require("../../lib/Error");
const bcrypt = require("bcrypt-nodejs");

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

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password) {
        if (typeof password !== "string" || password.length < PASS_LENGTH || is.not.email(email))
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, "Validation Error", "Wrong email or password");

        return null;
    }

}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema);