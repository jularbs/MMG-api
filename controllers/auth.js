const User = require("../models/user");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const { add } = require("date-fns");
const { createEntry } = require("../controllers/auditTrail");

const axios = require("axios");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    res
      .status(400)
      .json({ error: "Password and Confirm Password should match" });

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error:
          "Email address is already registered. Please proceed to logging in.",
        message: err,
      });
    }

    let username = shortId.generate();
    let newUser = new User({
      name,
      email,
      password,
      username,
    });

    newUser.save(async (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to signup new user.",
          message: err,
        });
      }

      res.json({
        success:
          "Signup Success! Please wait for your acccount to be processed.",
      });
    });
  });
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  //check if superadmin
  if (
    email == process.env.SUPER_ADMIN_UN &&
    password == process.env.SUPER_ADMIN_PW
  ) {
    const saToken = jwt.sign({ _id: email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", saToken, { expiresIn: "7d" });
    res.json({
      token: saToken,
      user: {
        name: "superadmin",
        email: "superadmin",
      },
    });

    // createEntry("superadmin", "Logged in to system", { email: email }, req);
  } else {
    //check if user exists
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "Email is not yet registered. Please create an account.",
        });
      }
      //authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Email and password do not match.",
        });
      }
      if (!user.status) {
        return res.status(400).json({
          error: "Account is not yet approved.",
        });
      }
      //generate JWT
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, { expiresIn: "7d" });
      const { _id, name, email, department } = user;
      res.json({
        token,
        user: {
          _id,
          name,
          email,
          department,
        },
      });
      // createEntry(user.name, "Logged in to system", { email: email }, req);
    });
  }
};

exports.listPendingUsers = async (req, res) => {
  User.find({ status: false })
    .select("_id name email createdAt department role")
    .exec((err, users) => {
      if (err)
        res.status(400).json({ error: "Error on getting pending users" });
      res.json(users);
    });
};

exports.processApproval = async (req, res) => {
  const { _id, department, status } = req.body;
  let user = await User.findOne({ _id }).exec();
  if (!user) {
    res.status(400).json({ error: "User does not exist" });
  }

  if (status) {
    user.department = department;
    user.status = status;

    user.save((err, result) => {
      if (err)
        res.status(400).json({
          error: "Failed to process approval",
        });
      res.json({
        success: `User is now ${status ? "approved" : "disapproved"}`,
      });
      createEntry(
        req.profile.name,
        `Approved registration for ${user.name}`,
        {},
        req
      );
    });
  } else {
    User.deleteOne({ _id }).exec((err, result) => {
      if (err)
        res.status(400).json({
          error: "Failed to process approval",
        });
      res.json({
        success: `User is now ${status ? "approved" : "disapproved"}`,
      });
      createEntry(
        req.profile.name,
        `Disapproved registration for ${user.name}`,
        {},
        req
      );
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.changePassword = (req, res) => {
  const { _id, currentPassword, newPassword, confirmation } = req.body;

  User.findOne({ _id }).exec((err, user) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to change password. Please try again later" });
    }

    if (!user.authenticate(currentPassword)) {
      return res.status(400).json({
        error: "Current password is incorrect.",
      });
    }

    if (newPassword !== confirmation) {
      return res.status(400).json({
        error: "New Password and confirmation should match",
      });
    }

    user.password = confirmation;

    user.save((err, result) => {
      if (err) {
        res.status(400).json({
          error: "Unable to change password. Please try again later",
        });
      }

      res.json({ success: "Password successfully changed" });
      createEntry(req.profile.name, `Changed Password`, {}, req);
    });
  });
};

exports.registeredUsers = (req, res) => {
  const { department } = req.query;
  if (!department) {
    User.find({ status: true })
      .select("_id name email createdAt department role")
      .exec((err, users) => {
        if (err)
          res.status(400).json({ error: "Error on getting registered users" });
        res.json(users);
      });
  } else {
    User.find({ status: true, department })
      .select("_id name email createdAt department role")
      .exec((err, users) => {
        if (err)
          res.status(400).json({ error: "Error on getting registered users" });
        res.json(users);
      });
  }
};

exports.deleteUser = (req, res) => {
  const { _id } = req.body;
  console.log(req.body);
  User.deleteOne({ _id }).exec((err, result) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to delete user. Please try again later" });
    }

    res.json({ success: "User deleted successfully." });
    createEntry(req.profile.name, `Deleted user`, { _id }, req);
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.captchaMiddleware = async (req, res, next) => {
  const { token } = req.body;

  const captcha = await axios({
    method: "POST",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    },
  });

  if (captcha.data.success) {
    next();
  } else {
    return res.status(400).json({
      error:
        "Bad Request due to robot test. Please try again or contact support.",
    });
  }
};

exports.authMiddleware = (req, res, next) => {
  if (req.user._id === process.env.SUPER_ADMIN_UN) {
    req.profile = {
      name: "superadmin",
    };
    next();
  } else {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      req.profile = user;
      next();
    });
  }
};
