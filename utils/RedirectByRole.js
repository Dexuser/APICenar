import UserRoles from "../models/enums/userRoles.js";
// utils/redirectByRole.js
export default function homeRouteByRole(user) {

    switch (user.role) {
        case UserRoles.ADMIN:
            return '/admin';
        case UserRoles.CLIENT:
            return '/client';
        case UserRoles.COMMERCE:
            return '/commerce';
        case UserRoles.DELIVERY:
            return '/delivery'
        default:
            return '/'
            break;
    }
}
