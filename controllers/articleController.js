import CategoryModel from "../models/Category.js";
import NewsModel from "../models/News.js";
import UserModel from "../models/User.js";
import { createError } from "../utils/errorMessage.js";
import fs from "fs";
import path from "path";
import { validationResult } from "express-validator";

const allArticle = async (req, res, next) => {
    try {
        let articles;
        if(req.role === "admin"){
            articles = await NewsModel.find()
                                            .populate("category", "name")
                                            .populate("author", "fullname");
        } else {
            articles = await NewsModel.find({ author: req.id })
                                            .populate("category", "name")
                                            .populate("author", "fullname");
        }
        res.render("admin/articles", { articles, role: req.role });
    } catch (error) {
        //res.status(500).send("Error fetching articles: " + error.message);
        next(error);
    }
};

const addArticlePage = async (req, res) => {
    const categories = await CategoryModel.find();
    res.render("admin/articles/create", { categories, role: req.role, errors: 0 });
};

const addArticle = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await CategoryModel.find();
        return res.render("admin/articles/create", { role: req.role, errors: errors.array(), categories });
    }
    try {
        const { title, content, category } = req.body;
        const newArticle = new NewsModel({
            title,
            content,
            category,
            image: req.file.filename,
            author: req.id
        });
        await newArticle.save();
        res.redirect("/admin/article");
    } catch (error) {
        //res.status(500).send("Error adding article: " + error.message);
        next(error);
    }
};

const updateArticlePage = async (req, res, next) => {
    try {
        const article = await NewsModel.findById(req.params.id)
                                        .populate("category", "name")
                                        .populate("author", "fullname");
        if (!article) {
            return next(createError("Article not found", 404));
        }
        if(req.role == "author"){
            if(req.id != article.author._id){
                return next(createError("Unauthorized", 401));
            }
        }
        const categories = await CategoryModel.find();
        res.render("admin/articles/update", { article, categories, role: req.role, errors: 0 });
        return;
    } catch (error) {
        //return res.status(500).send("Error fetching article: " + error.message);
        next(error);
    };
};

const updateArticle = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await CategoryModel.find();
        return res.render("admin/articles/update", { role: req.role, errors: errors.array(), article: req.body, categories });
    }
    try {
        const { title, content, category } = req.body;
        const article = await NewsModel.findById(req.params.id);
        if (!article) {
            return next(createError("Article not found", 404));
        }
        if(req.role == "author"){
            if(req.id != article.author._id){
                return next(createError("Unauthorized", 401));
            }
        }
        article.title = title;
        article.content = content;
        article.category = category;
        if (req.file) {
            const oldImagePath = path.join(import.meta.dirname, "../public/uploads", article.image);
            fs.unlinkSync(oldImagePath);
            article.image = req.file.filename;
        }
        await article.save();       
        res.redirect("/admin/article");
    } catch (error) {
        //res.status(500).send("Error updating article: " + error.message);
        next(error);
    }
};

const deleteArticle = async (req, res, next) => {
    try {
        const article = await NewsModel.findById(req.params.id);
        if (!article) {
            return next(createError("Article not found", 404));
        }
        if(req.role == "author"){
            if(req.id != article.author._id){
                return next(createError("Unauthorized", 401));
            }
        }
        const oldImagePath = path.join(import.meta.dirname, "../public/uploads", article.image);
        fs.unlinkSync(oldImagePath);
        await article.deleteOne();
        res.json({success: true });
    } catch (error) {
        //res.status(500).send("Error deleting article: " + error.message);
        next(error);
    }
};

export {
    allArticle,
    addArticlePage,
    addArticle,
    updateArticlePage,
    updateArticle,
    deleteArticle
};