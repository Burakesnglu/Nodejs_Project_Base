const express = require('express');
const router = express.Router();

const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const rolePrivileges = require('../config/role_privileges');

const Response = require('../lib/Response');
const CustomError = require('../lib/Error');

const Enum = require('../config/Enum');

router.get('/', async (req, res) => {

    try {

        let roles = await Roles.find({});

        res.json(Response.successResponse(roles));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);

    }

});

router.post('/add', async (req, res, next) => {

    let body = req.body

    try {

        if (!body.roleName) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Name field must be filled");

        if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "permissions must be an array");
        }

        let role = new Roles({
            roleName: body.roleName,
            isActive: true,
            createdBy: req.user?.id
        })

        await role.save();

        for (let i = 0; i < body.permissions.length; i++) {

            let priv = new RolePrivileges({
                roleId: role._id,
                permission: body.permissions[i],
                createdBy: req.user?.id
            })

            await priv.save();

        }

        res.json(Response.successResponse({ success: true }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }


});

router.post('/update', async (req, res, next) => {

    let body = req.body

    try {

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        let updates = {}

        if (body.roleName) updates.roleName = body.roleName;
        if (typeof body.isActive === "boolean") updates.isActive = body.isActive;

        if (body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0) {

            let permissions = await RolePrivileges.find({ roleId: body.id });

            let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission));
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));

            if (removedPermissions.length > 0) {
                // await RolePrivileges.deleteOne({ _id: { $in: removedPermissions.map(x => x._id) } }); 
                await RolePrivileges.deleteMany({ _id: removedPermissions.map(x => x._id) });
                //deleteMany kullanılabilir
            }

            if (newPermissions.length > 0) {
                for (let i = 0; i < newPermissions.length; i++) {

                    let priv = new RolePrivileges({
                        roleId: body._id,
                        permission: newPermissions[i],
                        createdBy: req.user?.id
                    })

                    await priv.save();

                }
            }

        }


        await Roles.updateOne({ _id: body._id }, updates)

        res.json(Response.successResponse({ success: true }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }


});

router.post('/delete', async (req, res, next) => {

    let body = req.body

    try {

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

        await Roles.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }


});

router.get('/rolePrivileges', async (req, res) => {

    res.json(rolePrivileges);

})


module.exports = router