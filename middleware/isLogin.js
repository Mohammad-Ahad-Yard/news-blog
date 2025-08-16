import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/admin");
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        req.id = tokenData.id;
        req.role = tokenData.role;
        req.fullname = tokenData.username;
        next();
    } catch (error) {
        return res.status(401).send("Unauthorized: Invalid token");
    }
};