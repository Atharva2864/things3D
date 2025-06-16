// Azure Function: /api/login
// Authenticates user and returns session (for demo, just returns user info)
const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
const crypto = require("crypto");

const TABLE_NAME = "users";
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_KEY;
const ENDPOINT = `https://${ACCOUNT_NAME}.table.core.windows.net`;

module.exports = async function (context, req) {
    // Validate environment variables
    if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
        context.log.error('Missing Azure Storage environment variables');
        return { status: 500, body: "Server configuration error." };
    }
    
    const { email, password } = req.body || {};
    if (!email || !password) {
        return { status: 400, body: "Email and password required." };
    }
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const client = new TableClient(ENDPOINT, TABLE_NAME, new AzureNamedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY));
    try {
        let user = await client.getEntity(TABLE_NAME, email);
        if (!user || user.password !== hash) {
            return { status: 401, body: "Invalid credentials." };
        }
        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        // For demo purposes, we'll return the token and email
        // In production, you'd store the session in a database or cache
        return { 
            status: 200, 
            body: { 
                user: { email: user.email },
                token: sessionToken
            } 
        };
    } catch (err) {
        context.log.error(err);
        return { status: 401, body: "Invalid credentials." };
    }
};
