const mail = require('@sendgrid/mail');
const multipart = require("parse-multipart-data");

module.exports = async function (context, req) {
    context.log('Get-Quote function processing a request.');

    // --- User Authentication Check ---
    // Azure Static Web Apps passes user info in this header.
    const header = req.headers["x-ms-client-principal"];
    if (!header) {
        return { status: 401, body: "Unauthorized: Please log in." };
    }
    const encoded = Buffer.from(header, "base64");
    const clientPrincipal = JSON.parse(encoded.toString("ascii"));
    const customerEmail = clientPrincipal.userDetails; // This is the logged-in user's email/name
    
    // --- Email Sending Logic ---
    try {
        mail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const parts = multipart.parse(req.body, boundary);

        const instructions = parts.find(p => p.name === 'instructions')?.data.toString('utf-8') || 'No instructions';
        const filePart = parts.find(p => p.name === 'file-upload');

        if (!filePart) {
            return { status: 400, body: "File is required." };
        }
        
        const attachment = {
            content: filePart.data.toString('base64'),
            filename: filePart.filename,
            type: filePart.type,
            disposition: 'attachment'
        };

        // --- 1. Email to YOU (the business owner) ---
        const ownerEmail = {
            to: 'machineazure886@gmail.com', // Your inbox
            from: 'quotes@things3d.store', // The line you change
            subject: `New 3D Print Quote Request from ${customerEmail}`, // Subject is here
            html: `<h2>New Quote Request Details:</h2>
                   <p><strong>Customer:</strong> ${customerEmail}</p>
                   <p><strong>Instructions:</strong></p>
                   <p>${instructions}</p>`,
            attachments: [attachment] // Attachment is here
        };

        // --- 2. Confirmation Email to the CUSTOMER ---
        const customerConfirmationEmail = {
            to: customerEmail,
            from: 'support@things3d.store', // The line you change
            subject: 'We have received your 3D print quote request!', // Subject is here
            html: `<h2>Thank you for your submission!</h2>
                   <p>Hi ${customerEmail},</p>
                   <p>This email confirms we've received your quote request for the file: <strong>${filePart.filename}</strong>.</p>
                   <p>We are reviewing your design and will get back to you with a personalized quote within 24 hours.</p>
                   <p>Thank you for choosing things3D!</p>`,
        };
        
        // Send both emails
        await Promise.all([
            mail.send(ownerEmail),
            mail.send(customerConfirmationEmail)
        ]);

        return {
            status: 200,
            body: "Quote request sent successfully! A confirmation email is on its way to your inbox."
        };

    } catch (error) {
        context.log.error('Error processing request:', error);
        return {
            status: 500,
            body: `An error occurred: ${error.message}`
        };
    }
};