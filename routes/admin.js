import express from "express";
import { allArticle, addArticlePage, addArticle, updateArticlePage, updateArticle, deleteArticle } from "../controllers/articleController.js";
import { allCategory, addCategoryPage, addCategory, updateCategoryPage, updateCategory, deleteCategory} from "../controllers/categoryController.js";
import { allComments, deleteComment, updateCommentStatus } from "../controllers/commentController.js";
import { loginPage, adminLogin, logout, dashboard, settings, saveSettings, allUser, addUserPage, addUser, updateUserPage, updateUser, deleteUser} from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/isLogin.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { upload } from "../middleware/multer.js";
import { articleValidation, categoryValidation, loginValidation, userUpdateValidation, userValidation } from "../middleware/validation.js";
const router = express.Router();

// Login Routes
router.get("/", loginPage);

router.post("/index", loginValidation, adminLogin);

router.get("/logout", logout);

router.get("/dashboard", isLoggedIn, dashboard);

router.get("/settings", isLoggedIn, isAdmin, settings);

router.post("/save-settings", isLoggedIn, isAdmin, upload.single("website_logo"), saveSettings);

// User CRUD Routes
router.get("/users", isLoggedIn, isAdmin, allUser);

router.get("/add-user", isLoggedIn, isAdmin, addUserPage);

router.post("/add-user", isLoggedIn, isAdmin, userValidation, addUser);

router.get("/update-user/:id", isLoggedIn, isAdmin, updateUserPage);

router.post("/update-user/:id", isLoggedIn, isAdmin, userUpdateValidation, updateUser);

router.delete("/delete-user/:id", isLoggedIn, isAdmin, deleteUser);

// Category CRUD Routes
router.get("/category", isLoggedIn, isAdmin, allCategory);

router.get("/add-category", isLoggedIn, isAdmin, addCategoryPage);

router.post("/add-category", isLoggedIn, isAdmin, categoryValidation, addCategory);

router.get("/update-category/:id", isLoggedIn, isAdmin, updateCategoryPage);

router.post("/update-category/:id", isLoggedIn, isAdmin, categoryValidation, updateCategory);

router.delete("/delete-category/:id", isLoggedIn, isAdmin, deleteCategory);

// Article CRUD Routes
router.get("/article", isLoggedIn, allArticle);

router.get("/add-article", isLoggedIn, addArticlePage);

router.post("/add-article", isLoggedIn, upload.single("image"), articleValidation, addArticle);

router.get("/update-article/:id", isLoggedIn, updateArticlePage);

router.post("/update-article/:id", isLoggedIn, upload.single("image"), articleValidation, updateArticle);

router.delete("/delete-article/:id", isLoggedIn, deleteArticle);

// Comment Routes
router.get("/comments", isLoggedIn, allComments);
router.put("/update-comment-status/:id", isLoggedIn, updateCommentStatus);
router.delete("/delete-comment/:id", isLoggedIn, deleteComment);

// 404 Middleware
router.use(isLoggedIn, (req, res, next) => {
  res.status(404).render("admin/404", {
    message: "Page Not Found",
    role: req.role
  });
});

// 500 Middleware
router.use(isLoggedIn, (err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    let view;
    switch (status) {
      case 404:
        view = "admin/404";
        break;
      case 401:
        view = "admin/401";
        break;
      case 500:
        view = "admin/500";
        break;
      default:
        view = "admin/500";
        break;
    }
    res.status(status).render(view, {
        message: err.message || "Something went wrong!",
        role: req.role
    });
});

export default router;