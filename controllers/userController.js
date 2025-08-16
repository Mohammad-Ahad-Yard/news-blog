import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import { validationResult } from "express-validator";
dotenv.config();
import UserModel from "../models/User.js";
import CategoryModel from "../models/Category.js";
import NewsModel from "../models/News.js";
import SettingModel from "../models/Setting.js";
import { createError } from "../utils/errorMessage.js";

const loginPage = (req, res) => {
    res.render("admin/login", { layout: false, errors: 0 });
};

const adminLogin = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
        return res.render("admin/login", { layout: false, errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return next(createError("Invalid Username or Password", 401));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createError("Invalid Username or Password", 401));
        }

        const token = jwt.sign(
            { id: user._id, username: user.fullname, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        });

        res.redirect("/admin/dashboard");
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/admin");
};

const dashboard = async (req, res, next) => {
    let articleCount;
    try {
        if(req.role == "author"){
            articleCount = await NewsModel.countDocuments({ author: req.id });
        } else {
            articleCount = await NewsModel.countDocuments();
        }
        const userCount = await UserModel.countDocuments();
        const categoryCount = await CategoryModel.countDocuments();

        res.render("admin/dashboard", {
            role: req.role,
            fullname: req.fullname,
            articleCount,
            userCount,
            categoryCount
        });
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

const settings = async (req, res, next) => {
    try {
        const settings = await SettingModel.findOne();
        res.render("admin/settings", { role: req.role, settings });
    } catch (error) {
        //return res.status(500).send("Internal Server Error");
        next(error);
    }
};

const saveSettings = async (req, res, next) => {
    const { website_title, footer_description } = req.body;
    const website_logo = req.file?.filename;

    try {
        let settings = await SettingModel.findOne({});
        if (!settings) {
            settings = new SettingModel();
        }
        settings.website_title = website_title;
        settings.footer_description = footer_description;
        if(website_logo){
            if(settings.website_logo) {
                const oldLogoPath = `./public/uploads/${settings.website_logo}`;
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
            settings.website_logo = website_logo;
        }
        await settings.save();
        res.redirect("/admin/settings");
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

const allUser = async (req, res) => {
    const users = await UserModel.find();
    res.render("admin/users", { users, role: req.role });
};

const addUserPage = (req, res) => {
    res.render("admin/users/create", { role: req.role, errors: 0 });
};

const addUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("admin/users/create", { role: req.role, errors: errors.array() });
    }
    await UserModel.create(req.body);
    res.redirect("/admin/users");
};

const updateUserPage = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if(!user) {
            return next(createError("User not found", 404));
        }
        res.render("admin/users/update", { user, role: req.role, errors: 0 });
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("admin/users/update", { role: req.role, errors: errors.array(), user: req.body });
    }
    const { fullname, password, role } = req.body;
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return next(createError("User not found", 404));
        }
        user.fullname = fullname || user.fullname;
        if(password) {
            user.password = password;
        }
        user.role = role || user.role;
        await user.save();
        res.redirect("/admin/users");
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await UserModel.findById(id);
        if (!user) {
            return next(createError("User not found", 404));
        }
        const article = await NewsModel.findOne({ author: id });
        if(article){
            return res.status(400).json({ success: false, message: "User is assocaited with an article" });
        }
        await user.deleteOne();
        res.json({ success: true });
    } catch (error) {
        //res.status(500).send("Internal Server Error");
        next(error);
    }
};

export {
    loginPage,
    adminLogin,
    logout,
    dashboard,
    settings,
    saveSettings,
    allUser,
    addUserPage,
    addUser,
    updateUserPage,
    updateUser,
    deleteUser
};