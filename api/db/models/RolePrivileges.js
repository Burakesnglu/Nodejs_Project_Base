const mongoose = require("mongoose");

const schema = mongoose.Schema({
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    permission:{
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
}, {
    versionKey: false,
    timestamps: true
});

class RolePrivileges extends mongoose.Model {

}

schema.loadClass(RolePrivileges);
module.exports = mongoose.model("rolePrivileges", schema);