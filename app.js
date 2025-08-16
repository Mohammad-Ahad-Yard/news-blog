import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import minifyHTML from 'express-minify-html-terser';
import compression from 'compression';
import frontEndRoutes from './routes/frontend.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(import.meta.dirname, 'public'), { maxAge: '1d' }));
app.use(cookieParser());
app.use(minifyHTML({
    override: true,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));
app.use(compression({
    level: 9,
    threshold: 10 * 1024, // Compress responses larger than 10KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false; // Don't compress if this header is set
        }
        return compression.filter(req, res); // Use default filter
    }
}));
//app.use('/public',express.static('public'));
app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("MongoDB connection error:", err)
});

app.use("/admin", (req, res, next) => {
    res.locals.layout = "admin/layout";
    next();
});
app.use("/admin", adminRoutes);
app.use('/', frontEndRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});