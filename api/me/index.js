// Azure Function: /api/me
// Returns user info if logged in (for demo, just returns null)
module.exports = async function (context, req) {
    // In production, check session/cookie
    // For demo, always return null (not logged in)
    return { status: 200, body: { user: null } };
};
