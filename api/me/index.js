// Azure Function: /api/me
// Returns user info if logged in based on Authorization header
module.exports = async function (context, req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { status: 200, body: { user: null } };
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // For demo purposes, we'll validate any non-empty token
        // In production, you'd validate against stored sessions
        if (token && token.length > 10) {
            // Extract email from token (simplified for demo)
            // In production, you'd look up the session in database
            const email = req.headers['x-user-email'] || 'user@example.com';
            
            return { 
                status: 200, 
                body: { 
                    user: { email: email }
                } 
            };
        }
        
        return { status: 200, body: { user: null } };
    } catch (error) {
        context.log.error('Error in /api/me:', error);
        return { status: 200, body: { user: null } };
    }
};
