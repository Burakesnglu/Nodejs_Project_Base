const mongoose = require("mongoose");

const schema = mongoose.Schema({  
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
});

class UserRoles extends mongoose.Model {

}

schema.loadClass(UserRoles);
module.exports = mongoose.model("userRoles", schema);