const mongoose = require("mongoose");

const schema = mongoose.Schema({
    level: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    location: {
        type: String,
    },
    procType: {
        type: String,
    },
    log: {
        type: mongoose.Schema.Types.Mixed,
    }
}, {
    versionKey: false,
    timestamps: true
});

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("auditLogs", schema);