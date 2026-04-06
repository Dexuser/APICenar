import "./utils/LoadEnvConfig.js"; // Load environment variables from .env file

import express from "express";
import { engine } from "express-handlebars";
import session from "express-session"; // Import express-session for session management
import flash from "connect-flash"; // Import connect-flash for flash messages

import path from "path";
import { projectRoot } from "./utils/Paths.js";

import authRoutes from "./routes/auth-router.js";
import adminRouter from "./routes/admin-router.js";
import clientRouter from "./routes/client-router.js";
import commerceRouter from "./routes/commerce-router.js";
import deliveryRouter from "./routes/delivery-router.js";

import UserRoles from "./models/enums/userRoles.js";

import { GetSection } from "./utils/helpers/Hbs/Section.js"; // Import the section helper
import { Equals } from "./utils/helpers/Hbs/Compare.js"; // Import the section helper
import connectDB from "./utils/MongooseConnection.js"; // Import the MongoDB connection utility

const app = express();

//render engine
app.engine(
  "hbs",
  engine({
    partialsDir: "views/partials",
    layoutsDir: "views/layouts",
    defaultLayout: "main-layout",
    extname: "hbs",
    helpers: {
      Equals: Equals, // Register the equals helper
      section: GetSection, // Register the section helper
    },
    
  })
);

// Set the view engine and views directory
app.set("view engine", "hbs");
app.set("views", "views");

// Set up static file serving and body parsing
app.use(express.urlencoded());
app.use(express.static(path.join(projectRoot, "public")));

// Set up session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || "anything",
    resave: false,
    saveUninitialized: false,
  })
); // Initialize session management

// Set up flash messages
app.use(flash()); // Initialize flash messages

app.use((req, res, next) => {
    // layout por defecto
    let layout = 'anonymous-layout';

    if (req.session && req.session.user) {
        switch(req.session.user.role) {

            case UserRoles.ADMIN:
                layout = 'admin-layout';
                break;

            case UserRoles.COMMERCE:
                layout = 'commerce-layout';
                break;

            case UserRoles.CLIENT:
                layout = 'client-layout';
                break;
            case UserRoles.DELIVERY:
                layout = 'delivery-layout';
                break;

            default:
                layout = 'anonymous-layout';
        }
    }

    res.locals.layout = layout; // asigna layout automáticamente
    next();
});


// Middleware to make the user available in the request object
app.use((req, res, next) => {
  if (!req.session) {
    return next();
  }
  if (!req.session.user) {
    return next();
  }

  if (!req.session.isAuthenticated) {
    return next();
  }

  req.user = req.session.user; // Make the user available in the request object
  next();
});

//locals variables
app.use((req, res, next) => {
  const errors = req.flash("errors");
  res.locals.user = req.user; // Make the user available in views
  res.locals.hasUser = !!req.user; // Check if the user is logged in
  res.locals.isAuthenticated = req.session.isAuthenticated || false; // Check if the user is authenticated
  res.locals.errors = errors; // Make flash errors available in views
  res.locals.hasErrors = errors.length > 0; // Check if there are any errors
  res.locals.success = req.flash("success"); // Make flash success messages available in views
  res.locals.hasSuccess = res.locals.success.length > 0; // Check if there are any success messages
  next();
});

//routes
app.use(authRoutes);
app.use("/admin", adminRouter);
app.use("/client", clientRouter);
app.use("/commerce", commerceRouter);
app.use("/delivery", deliveryRouter);


//404
app.use((req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.status(404).render("errors/404", { "page-title": "Page Not Found" });
  }

  // If the user is not authenticated, render a different layout
  return res.status(404).render("errors/404", {
    "page-title": "Page Not Found",
    layout: "anonymous-layout",
  });
});

try {
  // Connect to MongoDB
  await connectDB();
  app.listen(process.env.PORT || 5000);
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
} catch (err) {
  console.error("Error setting up the application:", err);
}
