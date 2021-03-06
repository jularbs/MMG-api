const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
var cron = require("node-cron");

//routes
const authRoutes = require("./routes/auth");
const heroRoutes = require("./routes/hero");
const mediaRoutes = require("./routes/media");
const portraitRoutes = require("./routes/portrait");
const simpleBusinessRoutes = require("./routes/simpleBusiness");
const metricRoutes = require("./routes/metric");
const logoShowcaseRoutes = require("./routes/logoShowcase");
const companyShowcaseRoutes = require("./routes/companyShowcase");
const sideBySideRoutes = require("./routes/sideBySide");
const categoryIrRoutes = require("./routes/categoryIR");
const fileIrRoutes = require("./routes/fileIR");
const jobPostingRoutes = require("./routes/jobPosting");
const basicPostRoutes = require("./routes/basicPost");
const faqRoutes = require("./routes/faq");
const testimonialRoutes = require("./routes/testimonial");
const historyRoutes = require("./routes/history");
const collaborationRoutes = require("./routes/collaboration");
const optionRoutes = require("./routes/option");

const app = express();

var allowedDomains = ["http://jularbs.com:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "Origin"],
  })
);

//DATABASE CONNECTIONS
let db = "";
if (process.env.NODE_ENV === "production") {
  db = process.env.DATABASE_PROD;
} else {
  db = process.env.DATABASE_DEV;
}

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB connected at ${db}`))
  .catch((error) => console.log("Error in connecting to DB: " + error));

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

//urlencoded
app.use(express.urlencoded({ extended: true }));

//use routes
app.use("/api", authRoutes);
app.use("/api", heroRoutes);
app.use("/api", mediaRoutes);
app.use("/api", portraitRoutes);
app.use("/api", simpleBusinessRoutes);
app.use("/api", metricRoutes);
app.use("/api", logoShowcaseRoutes);
app.use("/api", companyShowcaseRoutes);
app.use("/api", sideBySideRoutes);
app.use("/api", categoryIrRoutes);
app.use("/api", fileIrRoutes);
app.use("/api", jobPostingRoutes);
app.use("/api", basicPostRoutes);
app.use("/api", faqRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", historyRoutes);
app.use("/api", collaborationRoutes);
app.use("/api", optionRoutes);

app.use(express.static(__dirname + "/data/img"));

//cron jobs
cron.schedule("*/30 * * * *", function () {});

//port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Environment is ${process.env.NODE_ENV}`);
  console.log(`Server is running on port ${port}`);
});
