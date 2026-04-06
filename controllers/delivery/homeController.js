export async function getHome(req, res, next) {
    res.render("delivery/index", { "page-title": "Home"})
}