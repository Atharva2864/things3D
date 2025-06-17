const crypto = require("crypto");
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    context.log('Login API called');
    
    const { email, password } = req.body || {};
    if (!email || !password) {
        context.res = { 
            status: 400, 
            body: "Email and password required.",
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }

    // Hash password to compare
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Check if user exists and password matches
    const user = storage.getUser(email);
    if (!user || user.passwordHash !== hash) {
        context.res = { 
            status: 401, 
            body: "Invalid email or password",
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    
    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    storage.createSession(email, token);
    
    context.log('User logged in successfully:', email);
    
    context.res = {
        status: 200,
        body: {
            message: "Login successful",
            token: token,
            user: { email: email }
        },
        headers: { 'Content-Type': 'application/json' }
    };
};
