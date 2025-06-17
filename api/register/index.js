const crypto = require("crypto");
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    context.log('Register API called with body:', req.body);
    
    const { email, password } = req.body || {};
    if (!email || !password) {
        context.res = { 
            status: 400, 
            body: "Email and password required.",
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }

    // Check if user already exists
    if (storage.userExists(email)) {
        context.res = { 
            status: 400, 
            body: "User already exists",
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }

    // Hash password (simple, use bcrypt in production)
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Store user
    const user = storage.createUser(email, hash);
    
    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    storage.createSession(email, token);
    
    context.log('User registered successfully:', email);
    
    context.res = {
        status: 200,
        body: {
            message: "User registered successfully",
            token: token,
            email: email,
            user: { email: email }
        },
        headers: { 'Content-Type': 'application/json' }
    };
};
