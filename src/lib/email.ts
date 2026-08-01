import { env } from "cloudflare:workers";
import { ADMINS } from "./db";

export async function sendAdminNotificationEmail(
    requestType: string,
    userName: string,
    userEmail: string,
    data?: Record<string, unknown>
) {
    try {
        const apiKey = (env as Record<string, string> | undefined)?.RESEND_API_KEY || process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn("[Resend] RESEND_API_KEY environment variable is not configured. Email notification skipped.");
            return;
        }

        const typeLabels: Record<string, string> = {
            BOOKING_INQUIRY: "New Booking Inquiry",
            BOOKING_EDIT: "Booking Update Request",
            ARTIST_ADD: "New Artist Listing Request",
            ARTIST_EDIT: "Artist Profile Edit Request",
            ROLE_CHANGE: "Role Change Request",
            USER_EDIT: "User Profile Edit Request"
        };

        const label = typeLabels[requestType] || `Pending Request (${requestType})`;
        const adminUrl = "https://classicalrevolution.org/admin";

        // Format summary details from data
        let formattedData = "";
        if (data && Object.keys(data).length > 0) {
            formattedData = Object.entries(data)
                .map(([key, value]) => {
                    const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
                    return `<div style="margin-bottom: 6px;"><strong>${key}:</strong> ${displayValue}</div>`;
                })
                .join("");
        }

        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: #dc2626; margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em;">
                        Classical Revolution
                    </h2>
                    <p style="color: #71717a; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
                        Pending Admin Approval Alert
                    </p>
                </div>

                <h3 style="color: #18181b; font-size: 18px; margin: 0 0 12px 0;">
                    ${label}
                </h3>

                <p style="color: #3f3f46; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                    Submitted by <strong>${userName}</strong> (${userEmail}).
                </p>

                ${formattedData ? `
                    <div style="background-color: #f4f4f5; padding: 16px; border-left: 4px solid #dc2626; margin-bottom: 24px; font-size: 13px; color: #27272a;">
                        ${formattedData}
                    </div>
                ` : ''}

                <div style="margin: 28px 0 12px 0;">
                    <a href="${adminUrl}" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">
                        Go to Admin Page to Review
                    </a>
                </div>

                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0 12px 0;" />
                <p style="color: #a1a1aa; font-size: 11px; margin: 0;">
                    This is an automated notification sent from noreply@classicalrevolution.org
                </p>
            </div>
        `;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Classical Revolution <noreply@classicalrevolution.org>",
                to: ADMINS,
                subject: `[CR Admin] ${label} from ${userName}`,
                html: htmlContent
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`[Resend] Failed to send email (${response.status}):`, errBody);
        } else {
            console.log(`[Resend] Notification email sent successfully to ${ADMINS.join(", ")}`);
        }
    } catch (error) {
        console.error("[Resend] Exception while sending email notification:", error);
    }
}
