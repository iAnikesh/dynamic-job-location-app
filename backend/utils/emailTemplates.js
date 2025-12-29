/**
 * Generates a professional HTML email template for interview invitations
 * @param {string} candidateName 
 * @param {string} jobTitle 
 * @param {string} companyName 
 * @param {string} meetingLink 
 * @param {Date} scheduledDate 
 * @returns {string} HTML Email String
 */
const getInterviewEmailTemplate = (candidateName, jobTitle, companyName, meetingLink, scheduledDate) => {
    const dateString = scheduledDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Invitation</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #1a1a1a; }
        .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .detail-row { margin-bottom: 10px; }
        .detail-label { font-weight: 600; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { color: #0f172a; font-weight: 500; font-size: 16px; margin-top: 4px; }
        .button-container { text-align: center; margin-top: 35px; margin-bottom: 20px; }
        .cta-button { background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s; }
        .cta-button:hover { background-color: #1d4ed8; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interview Invitation</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${candidateName},</div>
            <p>We are pleased to invite you to an interview for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
            <p>Our team was impressed by your application and we would love to discuss your qualifications further.</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <div class="detail-label">When</div>
                    <div class="detail-value">${dateString}</div>
                </div>
                <div class="detail-row" style="margin-bottom: 0;">
                    <div class="detail-label">Where</div>
                    <div class="detail-value">Google Meet (Video Conference)</div>
                </div>
            </div>

            <div class="button-container">
                <a href="${meetingLink}" class="cta-button">Join Interview</a>
            </div>

            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
                Unable to click the button? Copy this link:<br>
                <a href="${meetingLink}" style="color: #2563eb; word-break: break-all;">${meetingLink}</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { getInterviewEmailTemplate };
