import express from "express";
import { loadCommonData } from "../middleware/loadCommonData.js";
import { index, articleByCategories, singleArticle, search, author, addComment, test } from "../controllers/siteController.js";
const router = express.Router();

router.use(loadCommonData);

router.get("/", index);

router.get("/category/:name", articleByCategories);

router.get("/single/:id", singleArticle);

router.get("/search", search);

router.get("/author/:name", author);

router.post("/single/:id/comment", addComment);

router.get("/test", test);

// 404 Middleware
router.use((req, res, next) => {
  res.status(404).render("404", {
    message: "Page Not Found"
  });
});

// 500 Middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).render("errors", {
        message: err.message || "Something went wrong!",
        status
    });
});

export default router;