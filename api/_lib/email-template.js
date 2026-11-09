/**
 * Brand-aligned HTML email template.
 * Pure inline CSS — webmail clients (Gmail, Outlook) strip <style> tags.
 */

const escapeHtml = (str) =>
    String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

export const buildEmailHtml = ({ name, email, message, inquiry, link, attachmentNames = [] }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
    const safeInquiry = escapeHtml(inquiry || 'general');
    const safeLink = link ? escapeHtml(link) : '';

    const attachmentBlock = attachmentNames.length
        ? `<tr><td style="padding:8px 0;color:#A0A0A0;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Attachments</td>
           <td style="padding:8px 0;color:#F5F5F5;">${attachmentNames.map((n) => escapeHtml(n)).join(', ')}</td></tr>`
        : '';

    const linkBlock = safeLink
        ? `<tr><td style="padding:8px 0;color:#A0A0A0;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Link</td>
           <td style="padding:8px 0;color:#D4AF37;"><a href="${safeLink}" style="color:#D4AF37;">${safeLink}</a></td></tr>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#050505;font-family:'Inter',Arial,sans-serif;color:#F5F5F5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:24px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:32px;">
        <tr><td>
          <p style="margin:0;font-family:'Inter',Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#D4AF37;text-transform:uppercase;">Portfolio · New Message</p>
          <h1 style="margin:8px 0 24px;font-family:'Syne',Georgia,serif;font-size:28px;font-weight:700;color:#F5F5F5;letter-spacing:-0.5px;">${safeName}</h1>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.18);">
            <tr><td style="padding:8px 0;color:#A0A0A0;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Email</td>
                <td style="padding:8px 0;color:#F5F5F5;"><a href="mailto:${safeEmail}" style="color:#D4AF37;">${safeEmail}</a></td></tr>
            <tr><td style="padding:8px 0;color:#A0A0A0;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Type</td>
                <td style="padding:8px 0;color:#F5F5F5;text-transform:capitalize;">${safeInquiry}</td></tr>
            ${linkBlock}
            ${attachmentBlock}
          </table>
          <div style="margin-top:24px;padding:20px;background:#141414;border-left:2px solid #D4AF37;border-radius:0 6px 6px 0;">
            <p style="margin:0;color:#F5F5F5;font-size:15px;line-height:1.6;">${safeMessage}</p>
          </div>
          <p style="margin:32px 0 0;color:#666;font-size:11px;letter-spacing:1px;">Sent via premchand.dev contact form</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export const buildEmailText = ({ name, email, message, inquiry, link, attachmentNames = [] }) => {
    const lines = [
        `New message from ${name} <${email}>`,
        `Type: ${inquiry || 'general'}`,
    ];
    if (link) lines.push(`Link: ${link}`);
    if (attachmentNames.length) lines.push(`Attachments: ${attachmentNames.join(', ')}`);
    lines.push('', '──', '', message, '', '──', 'Sent via premchand.dev contact form');
    return lines.join('\n');
};
