// Azure Function: /api/admin-users
// Admin endpoint to view all user credentials (for development/testing)
const storage = require("../shared/storage");

module.exports = async function (context, req) {
    try {
        // Simple admin check - in production, use proper authentication
        const adminKey = req.query.adminKey;
        if (adminKey !== "admin123") {
            context.res = { 
                status: 401, 
                body: "Unauthorized. Invalid admin key.",
                headers: { 'Content-Type': 'text/plain' }
            };
            return;
        }
        
        const users = storage.getAllUsers();
        
        // Create a detailed view of all users with their data
        const userDetails = users.map(user => ({
            email: user.email,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt
        }));
        
        // Create HTML response for easy viewing
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>User Admin Panel - things3D</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { background-color: #2563eb; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
                .stats { background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .password-hash { font-family: monospace; font-size: 12px; max-width: 200px; word-break: break-all; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>things3D - User Admin Panel</h1>
                <p>Development/Testing Environment</p>
            </div>
            
            <div class="stats">
                <h3>📊 Statistics</h3>
                <p><strong>Total Users:</strong> ${userDetails.length}</p>
                <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <h3>👥 Registered Users</h3>
            ${userDetails.length === 0 ? 
                '<p style="color: #666; font-style: italic;">No users registered yet.</p>' 
                : 
                `<table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Password Hash</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userDetails.map(user => `
                            <tr>
                                <td><strong>${user.email}</strong></td>
                                <td class="password-hash">${user.passwordHash}</td>
                                <td>${new Date(user.createdAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
                <h4>🔒 Security Note</h4>
                <p><strong>This is a development/testing endpoint.</strong> In production:</p>
                <ul>
                    <li>Use proper admin authentication (Azure AD, JWT tokens, etc.)</li>
                    <li>Never expose password hashes</li>
                    <li>Implement proper access controls</li>
                    <li>Use secure logging and auditing</li>
                </ul>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #666;">
                <p>Access URL: <code>${req.url}</code></p>
                <p>To refresh: <a href="${req.url}">Reload Page</a></p>
            </div>
        </body>
        </html>`;
        
        context.res = { 
            status: 200, 
            body: html,
            headers: { 'Content-Type': 'text/html' }
        };
        
    } catch (error) {
        context.log.error('Error in /api/admin-users:', error);
        context.res = { 
            status: 500, 
            body: `Internal server error: ${error.message}`,
            headers: { 'Content-Type': 'text/plain' }
        };
    }
};
