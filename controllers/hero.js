const Hero = require("../models/hero");
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
      hero.image = hero.image._id;
      hero.background = hero.background._id;
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

exports.read = async (req, res) => {};

exports.readByTypeLocation = async (req, res) => {
  const { type, location } = req.params;

  const hero = await Hero.findOne({
    heroType: type,
    heroLocation: location,
  })
    .populate("image", "key bucket")
    .populate("background", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: hero });
};

exports.list = async (req, res) => {};

exports.update = async (req, res) => {
  const { slug } = req.params;

  let toUpdate = await Hero.findOne({ slug }).exec();
  if (toUpdate) {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message: "Unable to parse data. Please contact web administrator.",
        });
      }

      //merge toupdate with fields
      toUpdate = _.merge(toUpdate, fields);
      toUpdate.slug = slug;

      //check if there is images
      if (!_.isEmpty(files)) {
        //upload images
        if (files.image) {
          try {
            const imageInfo = await upload(files.image, "hero/image");
            toUpdate.image = imageInfo.info._id;
          } catch (e) {
            res.status(400).json({
              status: "400",
              message: "Unable to update Hero. Image upload failed",
            });
          }
        }

        if (files.background) {
          try {
            const backgroundInfo = await upload(
              files.background,
              "hero/background"
            );
            toUpdate.background = backgroundInfo.info._id;
            console.log("Background Info: ", backgroundInfo);
          } catch (e) {
            res.status(400).json({
              status: "400",
              message: "Unable to update Hero. Background upload failed",
            });
          }
        }
      }

      toUpdate.save(async (err, result) => {
        if (err) {
          res.status(400).json({
            status: "400",
            message: "Unable to save Hero.",
          });
        } else {
          await result
            .populate("background", "_id key bucket")
            .populate("image", "_id key bucket")
            .execPopulate();
          res.json({
            status: "200",
            message: "Hero updated successfully.",
            data: result,
          });
        }
      });
    });
  } else {
    res.status(400).json({
      status: "400",
      message: "Hero not found.",
    });
  }
};

exports.delete = async (req, res) => {};
