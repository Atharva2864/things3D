// Azure Function: /api/logout
// Logs out user by invalidating session token
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            storage.deleteSession(token);
        }
        
        return { status: 200, body: { success: true, message: "Logged out successfully" } };
    } catch (error) {
        context.log.error('Error in /api/logout:', error);
        return { status: 200, body: { success: true } };
    }
};
