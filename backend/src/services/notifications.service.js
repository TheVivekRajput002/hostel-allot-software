import prisma from '../db/db.js'

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const sendEmail = async (to, subject, studentIds) => {
  try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Form Confirmation</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 30px 10px;">
                  <tr>
                    <td align="center">

                      <!-- Main Email Container -->
                      <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">

                        <!-- Header -->
                        <tr>
                          <td style="background-color: #1e3a8a; padding: 25px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                              Jabalpur Engineering College
                            </h1>
                            <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                              Hostel Allotment Portal
                            </p>
                          </td>
                        </tr>

                        <!-- Badge Status -->
                        <tr>
                          <td style="padding: 25px 30px 10px 30px; text-align: center;">
                            <div style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                              ✓ Application Received
                            </div>
                          </td>
                        </tr>

                        <!-- Main Body Content -->
                        <tr>
                          <td style="padding: 10px 30px 25px 30px; color: #334155; line-height: 1.6;">
                            <p style="font-size: 16px; margin-bottom: 16px;">
                              Dear Student,
                            </p>
                            <p style="font-size: 15px; margin-bottom: 20px; color: #475569;">
                              This is an official confirmation from <strong>JEC Jabalpur</strong> regarding your hostel allotment application. Your form details have been successfully received and recorded in our database.
                            </p>

                            <!-- Form IDs Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                              <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                Your Registered Form ID(s)
                              </p>
                              <div>
                                ${studentIds}
                              </div>
                            </div>

                            <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
                              Please keep this email and your Form ID(s) saved for future reference during document verification and allotment lists publication.
                            </p>
                          </td>
                        </tr>

                        <!-- Footer Divider -->
                        <tr>
                          <td style="padding: 0 30px;">
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding: 20px 30px; text-align: center; background-color: #f8fafc;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                              This is an automated operational email from <strong>JEC Jabalpur Hostel Administration</strong>.<br>
                              Please do not reply directly to this message.
                            </p>
                          </td>
                        </tr>

                      </table>

                    </td>
                  </tr>
                </table>

              </body>
              </html>
              `,
    });
    return info
  } catch (error) {
    console.error('Error sending email:', error);
  }
};





export { sendEmail };