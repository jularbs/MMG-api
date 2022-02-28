const Hero = require("../models/hero");
const Portrait = require("../models/portrait");
const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const slugify = require("slugify");

exports.create = async (req, res) => {
  //get incoming form
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        status: "400",
        message: "Unable to parse data. Please contact web administrator.",
      });
    }

    let toInsert = new Portrait();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(
      `${fields.name}-${fields.location}-${fields.group}`
    );

    // check files
    if (!_.isEmpty(files)) {
      //upload image
      if (files.image) {
        try {
          const imageInfo = await upload(files.image, "portrait/image");
          toInsert.image = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create Portrait. Image upload failed",
          });
        }
      }

      //upload logo
      if (files.logo) {
        try {
          const logoInfo = await upload(files.logo, "portrait/image");
          toInsert.logo = logoInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create Portrait. Image upload failed",
          });
        }
      }
    }

    //save
    toInsert.save(async (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          status: "400",
          message: "Unable to add portrait card.",
        });
      } else {
        await result
          .populate("logo", "_id key bucket")
          .populate("image", "_id key bucket")
          .execPopulate();
        res.status(200).json({
          status: "200",
          message: "Portrait added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.listByGroupLocation = async (req, res) => {
  const { group, location } = req.params;

  const portraits = await Portrait.find({
    group: group,
    location: location,
  })
    .populate("image", "key bucket")
    .populate("logo", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: portraits });
};

exports.list = async (req, res) => {};

exports.update = async (req, res) => {
  //get incoming form
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        status: "400",
        message: "Unable to parse data. Please contact web administrator.",
      });
    }

    //check if hero is existing by location and type
    let hero = await Hero.findOne({
      heroType: fields.heroType,
      heroLocation: fields.heroLocation,
    })
      .populate("image", "key bucket")
      .populate("background", "key bucket")
      .exec();

    let isCreate = true;
    if (hero) {
      //update the existing hero instead
      isCreate = false;
      hero = _.merge(hero, fields);

      if (hero.image) hero.image = hero.image._id;
      if (hero.background) hero.background = hero.background._id;
      if (hero.mobileBackground)
        hero.mobileBackground = hero.mobileBackground._id;
    } else {
      //create new hero
      isCreate = true;
      hero = new Hero();
      hero = _.merge(hero, fields);
      hero.slug = slugify(fields.title).toLowerCase();
    }

    //get files
    if (!_.isEmpty(files)) {
      if (files.image) {
        try {
          const imageInfo = await upload(files.image, "hero/image");
          hero.image = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: isCreate
              ? "Unable to create Hero. Image upload failed"
              : "Unable to update Hero. Image upload failed ",
          });
        }
      }

      if (files.background) {
        try {
          const backgroundInfo = await upload(
            files.background,
            "hero/background"
          );
          hero.background = backgroundInfo.info._id;
        } catch (e) {
          console.log("Error: ", e);
          return res.status(400).json({
            status: "400",
            message: isCreate
              ? "Unable to create Hero. Background upload failed"
              : "Unable to update Hero. Background upload failed",
          });
        }
      }

      if (files.mobileBackground) {
        try {
          const mobileBackgroundInfo = await upload(
            files.mobileBackground,
            "hero/background"
          );
          hero.mobileBackground = mobileBackgroundInfo.info._id;
        } catch (e) {
          console.log("Error: ", e);
          return res.status(400).json({
            status: "400",
            message: isCreate
              ? "Unable to create Hero. Mobile Background upload failed"
              : "Unable to update Hero. Mobile Background upload failed",
          });
        }
      }
    }

    hero.save(async (err, result) => {
      if (err) {
        console.log("Error: ", err);
        res.status(400).json({
          status: "400",
          message: isCreate ? "Unable to create Hero" : "Unable to update Hero",
        });
      } else {
        await result
          .populate("background", "_id key bucket")
          .populate("image", "_id key bucket")
          .populate("mobileBackground", "_id key bucket")
          .execPopulate();
        res.json({
          status: "200",
          message: isCreate
            ? "Hero created successfully."
            : "Hero updated successfully",
          data: result,
        });
      }
    });
  });
};

exports.delete = async (req, res) => {};
