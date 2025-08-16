import { body } from 'express-validator';

export const loginValidation = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .matches(/^\S+$/)
        .withMessage("Username cannot contain spaces")
        .isLength({ min: 5, max: 12 })
        .withMessage("Username must be between 5 and 12 characters long"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 5, max: 12 })
        .withMessage("Password must be between 5 and 12 characters long")
];

export const userValidation = [
    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 5, max: 25 })
        .withMessage("Full name must be between 5 and 25 characters long"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .matches(/^\S+$/)
        .withMessage("Username cannot contain spaces")
        .isLength({ min: 5, max: 12 })
        .withMessage("Username must be between 5 and 12 characters long"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 5, max: 12 })
        .withMessage("Password must be between 5 and 12 characters long"),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "author"])
        .withMessage("Role must be either 'admin' or 'author'")
];

export const userUpdateValidation = [
    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 5, max: 25 })
        .withMessage("Full name must be between 5 and 25 characters long"),
    body("password")
        .optional({ checkFalsy: true })
        .isLength({ min: 5, max: 12 })
        .withMessage("Password must be between 5 and 12 characters long"),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "author"])
        .withMessage("Role must be either 'admin' or 'author'")
];

export const categoryValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 3, max: 12 })
        .withMessage("Category name must be between 3 and 12 characters long"),
    body("description")
        .isLength({ max: 100 })
        .withMessage("Category description must be at most 100 characters long")
];

export const articleValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Article title is required")
        .isLength({ min: 7, max: 50 })
        .withMessage("Article title must be between 7 and 50 characters long"),
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Article content is required")
        .isLength({ min: 20 })
        .withMessage("Article content must be at least 20 characters long"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required")
];