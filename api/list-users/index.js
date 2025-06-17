// Azure Function: /api/list-users
// Lists all registered users (for testing purposes)
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    try {
        const users = storage.getAllUsers();
        
        // Remove password hashes for security
        const safeUsers = users.map(user => ({
            email: user.email,
            createdAt: user.createdAt
        }));
        
        context.res = { 
            status: 200, 
            body: { 
                users: safeUsers,
                count: safeUsers.length
            },
            headers: { 'Content-Type': 'application/json' }
        };
    } catch (error) {
        context.log.error('Error in /api/list-users:', error);
        context.res = { 
            status: 500, 
            body: { error: "Internal server error" },
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
    
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
