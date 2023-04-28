const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    versionKey: false,
    timestamps: true
});

class Roles extends mongoose.Model {


    static async deleteOne(query) {

        if (query._id) {
            await RolePrivileges.deleteMany({ roleId: query._id });
            //permissionları tek tek siliyor.
        }

        await super.deleteOne(query);

    }


}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);