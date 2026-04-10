import jwt from "jsonwebtoken";
  /**
   * Middleware to check if the user is authenticated
   * If the user is authenticated, proceed to the next middleware or route handler.
   * @param {*} req 
   * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export default function isAuth(req, res, next) {
try{
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if(!token) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  if(!payload) {
    const error = new Error("Invalid token.");
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };

  return next();

}catch (error) {
   error.statusCode = error.name ==="TokenExpiredError" ? 401 : (error.statusCode || 500);
   return next(error);
  }
}