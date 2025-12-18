// 邮件模板函数

export interface EmployeeCredentialsEmailData {
  email: string;
  username: string;
  password: string;
}

export interface AppointmentConfirmationEmailData {
  email: string;
  title: string;
  date: string;
  time: string;
  employeeName?: string;
}

export interface UserWelcomeEmailData {
  email: string;
  username: string;
  role: string;
}

// 员工凭证邮件模板
export function getEmployeeCredentialsEmail(data: EmployeeCredentialsEmailData): { subject: string; html: string } {
  const { email, username, password } = data;
  return {
    subject: "Your Employee Account Credentials",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0070f3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .credentials { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Team!</h1>
            </div>
            <div class="content">
              <p>Dear ${username},</p>
              <p>Your employee account has been created successfully. Please use the following credentials to log in:</p>
              <div class="credentials">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              <p>Please log in at: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin">Admin Portal</a></p>
              <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// 预约确认邮件模板
export function getAppointmentConfirmationEmail(data: AppointmentConfirmationEmailData): { subject: string; html: string } {
  const { email, title, date, time, employeeName } = data;
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return {
    subject: `Appointment Confirmation: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0070f3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .appointment-details { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed</h1>
            </div>
            <div class="content">
              <p>Dear Customer,</p>
              <p>Your appointment has been successfully booked. Here are the details:</p>
              <div class="appointment-details">
                <p><strong>Service:</strong> ${title}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${time}</p>
                ${employeeName ? `<p><strong>Assigned Employee:</strong> ${employeeName}</p>` : ""}
              </div>
              <p>We look forward to serving you!</p>
              <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// 用户欢迎邮件模板
export function getUserWelcomeEmail(data: UserWelcomeEmailData): { subject: string; html: string } {
  const { email, username, role } = data;
  return {
    subject: "Welcome to Our Platform!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0070f3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome!</h1>
            </div>
            <div class="content">
              <p>Dear ${username},</p>
              <p>Your account has been successfully created with the role: <strong>${role}</strong></p>
              <p>You can now log in and start using our platform.</p>
              <p>Log in at: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login">Login Page</a></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
