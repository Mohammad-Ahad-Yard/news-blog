import CategoryModel from "../models/Category.js";
import NewsModel from "../models/News.js";
import SettingModel from '../models/Setting.js';
import NodeCache from "node-cache";

const cache = new NodeCache();

export const loadCommonData = async (req, res, next) => {
    try {
        let latestNews = cache.get("latestNewsCache");
        let categories = cache.get("categoriesCache");
        let settings = cache.get("settingCache");
        if (!latestNews && !categories && !settings) {
            settings = await SettingModel.findOne();
        
            latestNews = await NewsModel.find()
                                        .populate("category", { name: 1, slug: 1 })
                                        .populate("author", "fullname")
                                        .sort({ createdAt: -1 }).limit(5).lean();

            const categoriesInUse = await NewsModel.distinct("category");
            categories = await CategoryModel.find({ _id: { $in: categoriesInUse } });

            cache.set("latestNewsCache", latestNews, 3600);
            cache.set("categoriesCache", categories, 3600);
            cache.set("settingCache", settings, 3600);
        }

        res.locals.settings = settings;
        res.locals.latestNews = latestNews;
        res.locals.categories = categories;

        next();
    } catch (error) {
        next(error);
    }
};

// cache methods -> get, set, del, flushAll, keys