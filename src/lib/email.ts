import {Resend} from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type SendInviteEmailParams = {
    to: string
    inviterName: string
    orgName: string
    inviteUrl: string
}

type SendWelcomeEmailParams = {
    to: string
    name: string
}

export async function sendInviteEmail({to, inviterName, orgName, inviteUrl}: SendInviteEmailParams): Promise<void> {
    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: `${inviterName} invited you to ${orgName} on FeedbackApp`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f9f9f9;
          margin: 0;
          padding: 0;
        ">
          <div style="
            max-width: 480px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            overflow: hidden;
          ">

            <!-- Header -->
            <div style="
              padding: 24px 32px;
              border-bottom: 1px solid #f0f0f0;
            ">
              <p style="
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: #000;
              ">
                FeedbackApp
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <h1 style="
                margin: 0 0 12px;
                font-size: 20px;
                font-weight: 500;
                color: #000;
                line-height: 1.3;
              ">
                You've been invited to ${orgName}
              </h1>

              <p style="
                margin: 0 0 24px;
                font-size: 14px;
                color: #666;
                line-height: 1.6;
              ">
                ${inviterName} has invited you to join the
                <strong style="color: #000;">${orgName}</strong>
                workspace on FeedbackApp — a tool for collecting and
                managing product feedback.
              </p>

              <a
                href="${inviteUrl}"
                style="
                  display: inline-block;
                  background: #000;
                  color: #fff;
                  text-decoration: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                "
              >
                Accept invitation
              </a>

              <p style="
                margin: 24px 0 0;
                font-size: 12px;
                color: #999;
                line-height: 1.6;
              ">
                Or copy this link into your browser:<br>
                <span style="color: #666; word-break: break-all;">
                  ${inviteUrl}
                </span>
              </p>

              <p style="
                margin: 16px 0 0;
                font-size: 12px;
                color: #999;
              ">
                This invitation expires in 7 days. If you weren't
                expecting this email you can safely ignore it.
              </p>
            </div>

            <!-- Footer -->
            <div style="
              padding: 16px 32px;
              border-top: 1px solid #f0f0f0;
              background: #fafafa;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                color: #999;
              ">
                Sent by FeedbackApp · You received this because
                ${inviterName} invited you
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
    })
}

export async function sendWelcomeEmail({to, name,}: SendWelcomeEmailParams): Promise<void> {
    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: "Welcome to FeedbackApp",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f9f9f9;
          margin: 0;
          padding: 0;
        ">
          <div style="
            max-width: 480px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            overflow: hidden;
          ">

            <div style="
              padding: 24px 32px;
              border-bottom: 1px solid #f0f0f0;
            ">
              <p style="
                margin: 0;
                font-size: 14px;
                font-weight: 500;
                color: #000;
              ">
                FeedbackApp
              </p>
            </div>

            <div style="padding: 32px;">
              <h1 style="
                margin: 0 0 12px;
                font-size: 20px;
                font-weight: 500;
                color: #000;
              ">
                Welcome, ${name}
              </h1>

              <p style="
                margin: 0 0 24px;
                font-size: 14px;
                color: #666;
                line-height: 1.6;
              ">
                Your FeedbackApp account is ready. Create a workspace,
                invite your team, and start collecting feedback from
                your users.
              </p>

              <a
                href="${process.env.NEXTAUTH_URL}/dashboard"
                style="
                  display: inline-block;
                  background: #000;
                  color: #fff;
                  text-decoration: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                "
              >
                Go to dashboard
              </a>
            </div>

            <div style="
              padding: 16px 32px;
              border-top: 1px solid #f0f0f0;
              background: #fafafa;
            ">
              <p style="
                margin: 0;
                font-size: 12px;
                color: #999;
              ">
                FeedbackApp · Collect feedback that matters
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
    })
}