const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NAME_MAX = 200
const MESSAGE_MAX = 5000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FROM = 'KC Talas <onboarding@resend.dev>'

const COLOR_BLUE = '#005fa0'
const COLOR_GREEN = '#23562b'
const COLOR_MUTED = '#4a5568'
const COLOR_BORDER = 'rgba(0, 95, 160, 0.25)'
const COLOR_SURFACE = '#f8fafb'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function messageToHtml(message: string): string {
  return escapeHtml(message).replaceAll('\n', '<br />')
}

function buildContactHtml(name: string, email: string, message: string): string {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = messageToHtml(message)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Contact form message</title>
</head>
<body style="margin:0;padding:0;background-color:#eceff1;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#eceff1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;border:1px solid ${COLOR_BORDER};overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(90deg, ${COLOR_BLUE} 0%, #3b82c4 100%);padding:20px 24px;">
              <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">KC Talas</p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">New contact form message</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;color:${COLOR_GREEN};">Full name</p>
                    <p style="margin:0;font-size:16px;color:#111827;">${safeName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;color:${COLOR_GREEN};">Email</p>
                    <p style="margin:0;font-size:16px;">
                      <a href="mailto:${safeEmail}" style="color:${COLOR_BLUE};text-decoration:none;">${safeEmail}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;color:${COLOR_GREEN};">Message</p>
                    <div style="padding:16px;background-color:${COLOR_SURFACE};border-radius:6px;border:1px solid ${COLOR_BORDER};font-size:15px;line-height:1.5;color:#1f2937;">${safeMessage}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid ${COLOR_BORDER};background-color:${COLOR_SURFACE};">
              <p style="margin:0;font-size:12px;color:${COLOR_MUTED};">Reply directly to this email to reach ${safeName}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

type ContactBody = {
  name?: unknown
  email?: unknown
  message?: unknown
}

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function validate(body: ContactBody): { ok: true; data: { name: string; email: string; message: string } } | { ok: false } {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name || name.length > NAME_MAX) return { ok: false }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) return { ok: false }
  if (!message || message.length > MESSAGE_MAX) return { ok: false }

  return { ok: true, data: { name, email, message } }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405)
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const contactTo = Deno.env.get('CONTACT_TO')
  if (!apiKey || !contactTo) {
    return jsonResponse({ error: 'server_misconfigured' }, 500)
  }

  let payload: ContactBody
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400)
  }

  const checked = validate(payload)
  if (!checked.ok) {
    return jsonResponse({ error: 'invalid_input' }, 400)
  }

  const { name, email, message } = checked.data
  const subject = `Contact: ${name}`
  const text = `KC Talas — contact form\n\nName: ${name}\nEmail: ${email}\n\n${message}`
  const html = buildContactHtml(name, email, message)

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [contactTo],
      reply_to: email,
      subject,
      text,
      html,
    }),
  })

  if (!resendRes.ok) {
    const detail = await resendRes.text()
    console.error('Resend error', resendRes.status, detail)
    return jsonResponse({ error: 'send_failed' }, 502)
  }

  return jsonResponse({ ok: true })
})
