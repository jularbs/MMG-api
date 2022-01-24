const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 32,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      require: true,
    },
    salt: String,
    resetPasswordLink: {
      token: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: false,
      require: true,
    },
    otp: {
      token: Number,
      validity: Date,
    },
    department: {
      type: String,
      default: "admin",
    },
    role: {
      type: String,
      default: "moderator",
      require: true,
    },
  },
  { timestamps: true }
);

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";

    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
  //account verification
  makeOTP: function () {
    const rand = Math.round(new Date().valueOf() * Math.random()) + "";
    const otp = rand.substr(0, 6);

    return otp;
  },
};

module.exports = mongoose.model("User", userSchema);
