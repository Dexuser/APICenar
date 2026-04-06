export async function getHome(req, res, next) {
    res.render("commerce/index", { "page-title": "Home"})
}