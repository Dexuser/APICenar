export async function getHome(req, res, next) {
    res.render("client/index", { "page-title": "Home"})
}