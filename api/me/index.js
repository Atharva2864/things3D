// Azure Function: /api/me
// Returns user info if logged in based on Authorization header
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { status: 200, body: { user: null } };
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate token against stored sessions
        const session = storage.getSession(token);
        if (!session) {
            return { status: 200, body: { user: null } };
        }
        
        // Get user data
        const user = storage.getUser(session.email);
        if (!user) {
            return { status: 200, body: { user: null } };
        }
        
        return { 
            status: 200, 
            body: { 
                user: { email: user.email }
            } 
        };
    } catch (error) {
        context.log.error('Error in /api/me:', error);
        return { status: 200, body: { user: null } };
    }
};
