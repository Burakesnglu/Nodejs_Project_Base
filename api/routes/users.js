var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt-nodejs");
const is = require("is_js");
const jwt = require("jwt-simple");

const Response = require('../lib/Response');
const CustomError = require('../lib/Error');
const Users = require('../db/models/Users');
const Enum = require('../config/Enum');
const Roles = require('../db/models/Roles');
const UserRoles = require('../db/models/UserRoles');
const config = require('../config');
const auth = require("../lib/auth")();

router.post('/register', async (req, res, next) => {

  let body = req.body

  try {

    let user = await Users.findOne({});

    if (user) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be filled");

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be a valid email address");

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Password field must be filled");

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password length must be greater than " + Enum.PASS_LENGTH);
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)

    let createdUser = await Users.create({
      email: body.email,
      password: password,
      isActive: body.isActive,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber
    })

    let role = await Roles.create({
      roleName: Enum.ROLES.SUPER_ADMIN,
      isActive: true,
      createdBy: createdUser._id
    })

    await UserRoles.create({
      roleId: role._id,
      userId: createdUser._id
    })

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED))
    //HTTP_CODES.CREATED: bir şey oluşturulduğunda bu kod kullanılır, 201 döner.

  } catch (error) {

    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse)

  }

});

router.post("/auth", async (req, res) => {
  try {

    let { email, password } = req.body;

    Users.validateFieldsBeforeAuth(email, password);

    let user = await Users.findOne({ email });

    if (!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Wrong email or password");

    if (!user.validPassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Error", "Wrong email or password");

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) * config.JWT.EXPIRE_TIME
    }

    let token = jwt.encode(payload, config.JWT.SECRET);

    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    }

    res.json(Response.successResponse({ token, user: userData }));

  } catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
})

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
})

router.get('/', async (req, res, next) => {

  try {

    let users = await Users.find({})

    res.json(Response.successResponse(users))

  } catch (error) {

    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse)

  }

});


router.post('/add', async (req, res, next) => {

  let body = req.body

  try {

    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be filled");

    if (is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email field must be a valid email address");

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Password field must be filled");

    if (body.password.length < Enum.PASS_LENGTH) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password length must be greater than " + Enum.PASS_LENGTH);
    }

    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Roles field must be an array");
    }

    let roles = await Roles.find({ _id: { $in: body.roles } })

    if (roles.length == 0) {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Roles field must be an array");
    }

    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null)

    let user = await Users.create({
      email: body.email,
      password: password,
      isActive: body.isActive,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber
    })

    for (let i = 0; i < roles.length; i++) {
      await UserRoles.create({
        roleId: roles[i]._id,
        userId: user._id
      })
    }

    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED))
    //HTTP_CODES.CREATED: bir şey oluşturulduğunda bu kod kullanılır, 201 döner.

  } catch (error) {

    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse)

  }

});


router.post('/update', async (req, res, next) => {

  let body = req.body

  try {

    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

    let updates = {}

    if (body.password && body.password.length >= Enum.PASS_LENGTH) {
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    } else {
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "password field must be at least 8 characters");
    }

    if (typeof body.isActive === "boolean") updates.isActive = body.isActive
    if (body.firstName) updates.firstName = body.firstName;
    if (body.lastName) updates.lastName = body.lastName;
    if (body.phoneNumber) updates.phoneNumber = body.phoneNumber;

    if (Array.isArray(body.roles) && body.roles.length > 0) {

      let userRoles = await UserRoles.find({ userId: body._id })

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.roleId));
      let newRoles = body.roles.filter(x => !userRoles.map(r => r.roleId).includes(x));
      //eski userrolesı silmiyor!

      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id.toString()) } })
      }

      if (newRoles.length > 0) {
        for (let i = 0; i < newRoles.length; i++) {
          let userRole = new UserRoles({
            roleId: newRoles[i],
            userId: body._id,
          })

          await userRole.save();

        }
      }

    }

    await Users.updateOne({ _id: body._id }, updates)

    res.json(Response.successResponse({ success: true }));

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }


})


router.post('/delete', async (req, res, next) => {

  let body = req.body

  try {

    if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id field must be filled");

    await Users.deleteOne({ _id: body._id });

    await UserRoles.deleteMany({ userId: body._id });

    res.json(Response.successResponse({ success: true }));

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }


})


module.exports = router;
