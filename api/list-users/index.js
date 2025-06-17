// Azure Function: /api/list-users
// Lists all registered users (for testing purposes)
const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

const TABLE_NAME = "users";
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_KEY;
const ENDPOINT = `https://${ACCOUNT_NAME}.table.core.windows.net`;

module.exports = async function (context, req) {
    // Validate environment variables
    if (!ACCOUNT_NAME || !ACCOUNT_KEY) {
        context.res = { 
            status: 500, 
            body: { error: "Azure Storage configuration missing" },
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    
    const client = new TableClient(ENDPOINT, TABLE_NAME, new AzureNamedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY));
    
    try {
        const users = [];
        const entities = client.listEntities();
        
        for await (const entity of entities) {
            users.push({
                email: entity.email,
                registered: entity.timestamp,
                partitionKey: entity.partitionKey,
                rowKey: entity.rowKey
                // Note: NOT including password hash for security
            });
        }
        
        context.res = {
            status: 200,
            body: { 
                count: users.length,
                users: users 
            },
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (err) {
        context.log.error(err);
        context.res = {
            status: 500,
            body: { error: "Failed to list users: " + err.message },
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
