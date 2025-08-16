import CategoryModel from "../models/Category.js";
import NewsModel from "../models/News.js";
import UserModel from "../models/User.js";
import CommentModel from "../models/Comment.js";
import { paginate } from "../utils/pagination.js";
import { createError } from "../utils/errorMessage.js";

const index = async (req, res) => {
    const paginatedNews = await paginate(
        NewsModel, 
        {}, 
        req.query, 
        { 
            populate: [
                { path: "category", select: "name slug" },
                { path: "author", select: "fullname" }
            ],
            sort: "-createdAt" 
        }
    );
    // res.json({ paginatedNews });
    res.render("index", { paginatedNews, query: req.query });
};

const articleByCategories = async (req, res, next) => {
    const category = await CategoryModel.findOne({ slug: req.params.name });
    if (!category) {
        return next(createError("Category not found", 404));
    }
    const paginatedNews = await paginate(
        NewsModel, 
        { category: category._id }, 
        req.query, 
        { 
            populate: [
                { path: "category", select: "name slug" },
                { path: "author", select: "fullname" }
            ],
            sort: "-createdAt" 
        }
    );
    res.render("category", { paginatedNews, category, query: req.query });
};

const singleArticle = async (req, res, next) => {
    const singleNews = await NewsModel.findById(req.params.id)
                                .populate("category", { name: 1, slug: 1 }) 
                                .populate("author", "fullname")      
                                .sort({ createdAt: -1 });
    if(!singleNews) return next(createError("Article not found", 404));
    // Get all comments for the article
    const comments = await CommentModel.find({ article: req.params.id, status: 'approved' })
                                        .sort({ createdAt: -1 });
    // res.json({ singleNews, comments });
    res.render("single", { singleNews, comments });
};

const search = async (req, res) => {
    const searchQuery = req.query.search;
    const paginatedNews = await paginate(
        NewsModel, 
        {
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { content: { $regex: searchQuery, $options: "i" } }
            ] 
        }, 
        req.query, 
        { 
            populate: [
                { path: "category", select: "name slug" },
                { path: "author", select: "fullname" }
            ],
            sort: "-createdAt" 
        }
    );
    res.render("search", { paginatedNews, searchQuery, query: req.query  });
};

const author = async (req, res, next) => {
    const author = await UserModel.findOne({ _id: req.params.name });
    if (!author) {
        return next(createError("Author not found", 404));
    }
    const paginatedNews = await paginate(
        NewsModel, 
        { author: req.params.name }, 
        req.query, 
        { 
            populate: [
                { path: "category", select: "name slug" },
                { path: "author", select: "fullname" }
            ],
            sort: "-createdAt" 
        }
    );
    res.render("author", { paginatedNews, author, query: req.query });
};

const addComment = async (req, res, next) => {
    try {
        const { name, email, content } = req.body;

        if (!name || !email || !content) {
            return res.status(400).send("All fields are required");
        }

        const comment = new CommentModel({
            name,
            email,
            content,
            article: req.params.id
        });

        await comment.save();
        res.redirect(`/single/${req.params.id}`);
    } catch (error) {
        return next(createError("Error adding comment", 500));
    }
};

export const test = async (req, res) => {
    const news = await NewsModel.find();
    res.json(news);
    //res.send("This is long string".repeat(50000));
};

export {
    index,
    articleByCategories,
    singleArticle,
    search,
    author,
    addComment
};