const Portrait = require("../models/portrait");
const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");
const Testimonial = require("../models/testimonial");
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

    let toInsert = new Testimonial();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(`${fields.name}_${fields.location}`).toLowerCase();

    const isExisting = await Testimonial.findOne({
      slug: toInsert.slug,
    }).exec();

    if (isExisting) {
      const rand = Math.floor(Date.now() / 1000);
      toInsert.slug = `${toInsert.slug}-${rand}`;
    }

    // check files
    if (!_.isEmpty(files)) {
      //upload image
      if (files.image) {
        try {
          const imageInfo = await upload(files.image, "testimonials/image");
          toInsert.image = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create Testimonial. Image upload failed",
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
          message: "Unable to add testimonial.",
        });
      } else {
        await result.populate("image", "_id key bucket").execPopulate();
        res.status(200).json({
          status: "200",
          message: "Testimonial added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.listByLocation = async (req, res) => {
  const { location } = req.params;

  const testimonials = await Testimonial.find({
    location: location,
    deletedAt: null,
  })
    .populate("image", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: testimonials });
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
    let toUpdate = await Testimonial.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.image) {
          try {
            const imageInfo = await upload(files.image, "testimonials/image");
            toUpdate.image = imageInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message:
                "Failed on image upload, please try again or contact administrator",
            });
          }
        }
      }

      toUpdate.save(async (err, result) => {
        if (err) {
          res.status(400).json({
            status: "400",
            message:
              "Testimonial update failed, please try again or contact administrator",
          });
        } else {
          await result.populate("image", "_id key bucket").execPopulate();

          res.json({
            status: "200",
            message: "Testimonial edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Testimonial to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const testimonial = await Testimonial.findOne({ slug }).exec();

  if (testimonial) {
    testimonial.deletedAt = dateNow;
    testimonial.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen testimonial. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Testimonial deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Testimonial you are trying to delete doesn't exist",
    });
  }
};
