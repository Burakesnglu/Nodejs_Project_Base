const express = require("express");
const router = express.Router();
const moment = require("moment");

const AuditLogs = require("../db/models/AuditLogs");
const Response = require("../lib/Response");
const auth = require("../lib/auth")();

router.all("*", auth.authenticate(), (req, res, next) => {
    next();
})

router.get("/", auth.checkRoles("auditlogs_view"), async (req, res, next) => {

    try {

        let body = req.body;
        let query = {};
        let skip = body.skip;
        let limit = body.limit;

        if (typeof body.skip !== "number") {
            skip = 0;
        }

        if (typeof body.limit !== "number" || body.limit > 500) {
            limit = 500;
        }

        if (body.startDate && body.endDate) {
            query.createdAt = {
                $gte: moment(body.startDate),
                $lte: moment(body.endDate)
            }
        } else {
            query.createdAt = {
                $gte: moment().subtract(1, "day").startOf("day"),
                $lte: moment()
            }
        }


        let auditLogs = await AuditLogs.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json(Response.successResponse(auditLogs));

    } catch (error) {

        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);

    }

})

module.exports = router;