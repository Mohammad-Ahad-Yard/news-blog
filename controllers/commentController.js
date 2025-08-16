import CommentModel from "../models/Comment.js";
import NewsModel from "../models/News.js";
import { createError } from "../utils/errorMessage.js";

export const allComments = async (req, res) => {
    try {
        let comments;
        if(req.role === 'admin') {
            comments = await CommentModel.find()
                .populate("article", "title")
                .sort({ createdAt: -1 });
        } else {
            const news = await NewsModel.find({ author: req.id });
            const newsIds = news.map(n => n._id);
            comments = await CommentModel.find({ article: { $in: newsIds } })
                .populate("article", "title")
                .sort({ createdAt: -1 });
        }
        // res.json(comments);
        res.render("admin/comments", { role: req.role, comments });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};

export const updateCommentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const comment = await CommentModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        next(createError("Failed to update comment status", 500));
    }
};

export const deleteComment = async (req, res, next) => {
    const { id } = req.params;

    try {
        const comment = await CommentModel.findByIdAndDelete(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        next(createError("Failed to delete comment", 500));
    }
};