// Azure Function: /api/logout
// Logs out user (for demo, just returns success)
module.exports = async function (context, req) {
    // In production, clear session/cookie
    return { status: 200, body: { success: true } };
};
