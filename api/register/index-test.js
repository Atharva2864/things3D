// Test version of register without Azure Storage
const crypto = require("crypto");

module.exports = async function (context, req) {
    context.log('Register API called');
    
    const { email, password } = req.body || {};
    
    if (!email || !password) {
        context.res = { 
            status: 400, 
            body: "Email and password required.",
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }

    // For testing - just return success with a mock token
    const mockToken = crypto.randomBytes(32).toString('hex');
    
    context.res = {
        status: 200,
        body: {
            message: "User registered successfully",
            token: mockToken,
            email: email,
            user: { email: email }
        },
        headers: { 'Content-Type': 'application/json' }
    };
};
