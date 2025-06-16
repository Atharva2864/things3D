// Azure Function: /api/register
// Registers a new user (email, password) and stores in Azure Table Storage (or Cosmos DB)
// NOTE: This is a simple example. In production, use password hashing and validation!
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
        context.res = { 
            status: 500, 
            body: { error: "Azure Storage configuration missing. Please set AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_KEY environment variables." },
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    
    const { email, password } = req.body || {};
    if (!email || !password) {
        return { status: 400, body: "Email and password required." };
    }
    // Hash password (simple, use bcrypt in production)
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const client = new TableClient(ENDPOINT, TABLE_NAME, new AzureNamedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY));
    try {
        // Check if user exists
        let existing = await client.getEntity(TABLE_NAME, email).catch(() => null);
        if (existing) {
            return { status: 409, body: "User already exists." };
        }
        // Create user
        await client.createEntity({ partitionKey: TABLE_NAME, rowKey: email, email, password: hash });
        // Set simple session token
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        
        context.res = {
            status: 200,
            body: { email, token },
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return;
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { error: "Registration failed: " + err.message },
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
};
