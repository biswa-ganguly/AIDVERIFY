import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });
};

// 1. When NGO application is submitted
export async function sendApplicationReceived(email, ngoName, campaignName) {
  const transporter = createTransporter();
  
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);padding:40px;text-align:center;">
              <tr>
                <td>
                  <h1 style="color:#2563eb;margin-bottom:20px;">🎉 Campaign Request Received</h1>
                  <p style="color:#374151;font-size:16px;line-height:1.6;">
                    Dear <strong>${ngoName}</strong>,<br><br>
                    Thank you for submitting your campaign <strong>"${campaignName}"</strong>.  
                    Our system has successfully received your details.
                  </p>
                  <p style="color:#6b7280;font-size:14px;">
                    You will be notified once our AI agent reviews your application.
                  </p>
                  <hr style="border:0;border-top:1px solid #e5e7eb;margin:30px 0;">
                  <p style="color:#9ca3af;font-size:12px;">This is an automated email. Please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  await transporter.sendMail({
    from: `"AidVerify" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: "AidVerify Campaign Registration 🎉",
    html: htmlTemplate
  });
}

// 2. When AI updates the AIApproval field
export async function sendAIVerificationResult(email, ngoName, campaignName, accepted) {
  const transporter = createTransporter();
  
const htmlTemplate = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,0.12);overflow:hidden;">
            <!-- Header Section -->
            <tr>
              <td style="background:${accepted ? '#d1fae5' : '#fee2e2'};padding:30px;text-align:center;">
                <h1 style="margin:0;font-size:28px;color:${accepted ? '#065f46' : '#b91c1c'};">
                  ${accepted ? '✅ Campaign Pre-Approved' : '❌ Campaign Rejected'}
                </h1>
              </td>
            </tr>
            
            <!-- Body Section -->
            <tr>
              <td style="padding:40px;text-align:center;">
                <p style="color:#374151;font-size:16px;line-height:1.8;margin-bottom:20px;">
                  Dear <strong>${ngoName}</strong>,<br><br>
                  Our AI review has 
                  <strong style="color:${accepted ? '#059669' : '#dc2626'};">
                    ${accepted ? 'pre-approved' : 'rejected'}
                  </strong> 
                  your campaign <strong>"${campaignName}"</strong>.
                </p>

                ${accepted ? `
                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:20px;margin:20px auto;max-width:400px;">
                    <p style="margin:0;color:#065f46;font-size:14px;line-height:1.6;">
                      🎯 <strong>Next Step:</strong><br>
                      Your request will now be reviewed by the Admin team for <strong>final approval</strong>.
                    </p>
                  </div>
                ` : `
                  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:20px auto;max-width:400px;">
                    <p style="margin:0;color:#991b1b;font-size:14px;line-height:1.6;">
                      ⚠️ Unfortunately, your campaign did not pass AI validation.<br>
                      You may re-apply after making improvements.
                    </p>
                  </div>
                `}
              </td>
            </tr>
            
            <!-- Footer Section -->
            <tr>
              <td style="padding:20px;text-align:center;border-top:1px solid #e5e7eb;background:#f9fafb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  This is an automated email. Please do not reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;


  await transporter.sendMail({
    from: `"AidVerify" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: `AidVerify AI Review - ${accepted ? 'Pre-Approved' : 'Rejected'} ✨`,
    html: htmlTemplate
  });
}

// 3. When admin approves/rejects the application  
export async function sendAdminDecision(email, ngoName, campaignName, approved, ngoId) {
  const transporter = createTransporter();
  
  const ngoDashboardLink = `${process.env.FRONTEND_URL}/ngo-dashboard/${ngoId}`;
  
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);padding:40px;text-align:center;">
              <tr>
                <td>
                  <h1 style="color:#2563eb;margin-bottom:20px;">
                    ${approved ? '🎊 Campaign Approved!' : '❌ Campaign Rejected'}
                  </h1>
                  <p style="color:#374151;font-size:16px;line-height:1.6;">
                    Dear <strong>${ngoName}</strong>,<br><br>
                    Your campaign <strong>"${campaignName}"</strong> has been 
                    <strong>${approved ? 'approved' : 'rejected'}</strong> by our Admin team.
                  </p>
                  ${approved ? `
                  <p style="color:#6b7280;font-size:14px;">
                    You can now access your NGO Dashboard to manage campaigns and track progress.  
                    <br><br>
                    <strong>Dashboard Link:</strong> <a href="${ngoDashboardLink}" style="color:#2563eb;">Open Dashboard</a><br>
                    <strong>NGO ID:</strong> ${ngoId}
                  </p>
                  <p style="color:#f59e0b;font-size:14px;">
                    ⚠️ Please open the link first, then enter your NGO ID to access the dashboard.
                  </p>` :
                  '<p style="color:#ef4444;font-size:14px;">Unfortunately, your campaign request has been rejected. You may reapply with improved details.</p>'
                  }
                  <hr style="border:0;border-top:1px solid #e5e7eb;margin:30px 0;">
                  <p style="color:#9ca3af;font-size:12px;">This is an automated email. Please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  await transporter.sendMail({
    from: `"AidVerify" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: `AidVerify Admin Decision - ${approved ? 'Approved' : 'Rejected'} 🎯`,
    html: htmlTemplate
  });
}