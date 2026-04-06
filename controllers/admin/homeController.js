export async function getHome(req, res, next) {
    res.render("admin/index", { "page-title": "Home"})
}