const storage = require("../shared/storage");
const multipart = require("parse-multipart-data");

module.exports = async function (context, req) {
    context.log('Get-Quote function processing a request.');

    // --- User Authentication Check ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { status: 401, body: "Unauthorized: Please log in." };
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const session = storage.getSession(token);
    if (!session) {
        return { status: 401, body: "Unauthorized: Invalid session." };
    }
    
    const user = storage.getUser(session.email);
    if (!user) {
        return { status: 401, body: "Unauthorized: User not found." };
    }
    
    const customerEmail = user.email;
    
    // --- Email Sending Logic (Simplified for testing) ---
    try {
        // For now, we'll simulate email sending and just return a success message
        // In production, you would uncomment the SendGrid code below
        
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.parse(req.body, boundary);

        const name = parts.find(p => p.name === 'name')?.data.toString('utf-8') || 'Unknown';
        const email = parts.find(p => p.name === 'email')?.data.toString('utf-8') || customerEmail;
        const instructions = parts.find(p => p.name === 'instructions')?.data.toString('utf-8') || 'No special instructions';
        const filePart = parts.find(p => p.name === 'file-upload');

        if (!filePart) {
            return { status: 400, body: "File is required." };
        }
        
        // Log the quote request for now
        context.log('Quote request received:', {
            customer: customerEmail,
            name: name,
            email: email,
            filename: filePart.filename,
            fileSize: filePart.data.length,
            instructions: instructions
        });
        
        // TODO: Implement SendGrid email sending
        // const mail = require('@sendgrid/mail');
        // mail.setApiKey(process.env.SENDGRID_API_KEY);
        // ... email sending logic ...

        return {
            status: 200,
            body: `Quote request received successfully! We'll review your file "${filePart.filename}" and get back to you at ${customerEmail} within 24 hours.`
        };

    } catch (error) {
        context.log.error('Error processing request:', error);
        return {
            status: 500,
            body: `An error occurred: ${error.message}`
        };
    }
};