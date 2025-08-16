import CategoryModel from "../models/Category.js";
import NewsModel from "../models/News.js";
import { validationResult } from "express-validator";
import { createError } from "../utils/errorMessage.js";

const allCategory = async (req, res) => {
    const categories = await CategoryModel.find();
    res.render("admin/categories", { categories, role: req.role });
};

const addCategoryPage = (req, res) => {
    res.render("admin/categories/create", { role: req.role, errors: 0 });
};

const addCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("admin/categories/create", { role: req.role, errors: errors.array() });
    }
    try {
        await CategoryModel.create(req.body);
        res.redirect("/admin/category");
    } catch (error) {
        //res.status(500).send(error);
        next(error);
    }
};

const updateCategoryPage = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return next(createError("Category not found", 404));
        }
        res.render("admin/categories/update", { category, role: req.role, errors: 0 });
    } catch (error) {
        //res.status(500).send(error);
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const category = await CategoryModel.findById(req.params.id);
        return res.render("admin/categories/update", { role: req.role, errors: errors.array(), category });
    }
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return next(createError("Category not found", 404));
        }
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        await category.save();
        res.redirect("/admin/category");
    } catch (error) {
        //res.status(500).send(error);
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await CategoryModel.findById(id);
        if (!category) {
            return next(createError("Category not found", 404));
        }
        const article = await NewsModel.findOne({ category: id });
        if (article) {
            return res.status(400).json({ success: false, message: "Category is associated with an article" });
        }
        await category.deleteOne();
        res.status(200).json({ success: true });
    } catch (error) {
        //res.status(500).send(error);
        next(error);
    }
};

export {
    allCategory,
    addCategoryPage,
    addCategory,
    updateCategoryPage,
    updateCategory,
    deleteCategory
};