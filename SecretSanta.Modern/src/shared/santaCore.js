// Shared core logic for Skinner Family Secret Santa (Solver, Sanitizer, Festive Email Builder)

export function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  // Fix typos like "xhttps://..."
  trimmed = trimmed.replace(/^[a-zA-Z]+(https?:\/\/)/i, '$1');
  if (!/^https?:\/\//i.test(trimmed) && trimmed.includes('.') && !trimmed.includes(' ')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

export function normalizeGiftItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      let name = (item?.name || '').trim();
      let description = (item?.description || '').trim();
      let url = sanitizeUrl(item?.url || '');

      // If someone pasted a URL into the Name field and left URL blank (like Fritz did in 2025)
      if (!url && /^https?:\/\//i.test(name)) {
        url = sanitizeUrl(name);
        try {
          const parsed = new URL(url);
          const host = parsed.hostname.replace(/^www\./i, '');
          const slug = parsed.pathname
            .split('/')
            .filter((seg) => seg && seg.length > 3 && !/^(dp|gp|product|products|p)$/i.test(seg))[0];
          name = slug
            ? `${slug.replace(/[-_]+/g, ' ')} (${host})`
            : `Gift Link (${host})`;
        } catch {
          name = 'Gift Link';
        }
      }

      return { name, description, url };
    })
    .filter((i) => i.name || i.url || i.description);
}

/**
 * Guaranteed Backtracking Graph Solver (Hamiltonian/Derangement Matching)
 * Replaces the old random while-loop with goto Start.
 */
export function solveSecretSantaDraw(members) {
  const ids = members.map((m) => m.id);
  const ineligibleMap = new Map();

  for (const m of members) {
    const blocked = new Set([m.id, m.spouseId, ...(m.ineligible || [])]);
    ineligibleMap.set(m.id, blocked);
  }

  // Sort givers by most constrained first to prune dead-ends immediately
  const givers = [...ids].sort((a, b) => {
    const validA = ids.filter((r) => !ineligibleMap.get(a).has(r)).length;
    const validB = ids.filter((r) => !ineligibleMap.get(b).has(r)).length;
    return validA - validB;
  });

  const assignment = new Map();
  const usedReceivers = new Set();

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function backtrack(index) {
    if (index === givers.length) return true;
    const giverId = givers[index];
    const blocked = ineligibleMap.get(giverId);
    const candidates = shuffle(
      ids.filter((rId) => !blocked.has(rId) && !usedReceivers.has(rId))
    );

    for (const receiverId of candidates) {
      assignment.set(giverId, receiverId);
      usedReceivers.add(receiverId);
      if (backtrack(index + 1)) return true;
      assignment.delete(giverId);
      usedReceivers.delete(receiverId);
    }
    return false;
  }

  if (!backtrack(0)) {
    throw new Error(
      'No valid draw exists with the current exclusion rules. Check the Exclusion Matrix in Admin.'
    );
  }

  return members.map((giver) => {
    const receiverId = assignment.get(giver.id);
    const receiver = members.find((m) => m.id === receiverId);
    return {
      giverId: giver.id,
      giverName: giver.name,
      giverEmail: giver.email,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverEmail: receiver.email
    };
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates a festive, mobile-responsive HTML email for a Secret Santa pairing.
 * Automatically pulls Spouse Suggestions from the RECEIVER'S SPOUSE so tips go to the right Santa!
 */
export function buildFestiveEmailHtml({ giver, receiver, allMembers, year, isTest }) {
  const receiverSpouse = allMembers.find((m) => m.id === receiver.spouseId);

  // Combine suggestions entered BY the receiver's spouse + any legacy suggestions on receiver
  const spouseTips = normalizeGiftItems([
    ...(receiverSpouse?.suggestionsForSpouse || []),
    ...(receiver.spouseSuggestion || [])
  ]);

  const wishlist = normalizeGiftItems(receiver.favoriteThings || []);
  const doNotBuy = (receiver.doNotBuy || []).filter((x) => x && String(x).trim());

  const testBanner = isTest
    ? `<div style="background-color:#fef3c7;border:2px dashed #d97706;color:#92400e;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:14px;text-align:center;">
         <strong>TEST MODE PREVIEW</strong> — Intended for <strong>${escapeHtml(giver.name)}</strong> (${escapeHtml(giver.email)})
       </div>`
    : '';

  const wishlistHtml =
    wishlist.length > 0
      ? wishlist
          .map(
            (item) => `
          <tr>
            <td style="padding:12px 14px;border-bottom:1px solid #f1ece1;">
              <div style="font-size:15px;font-weight:700;color:#1c2e24;">
                🎁 ${escapeHtml(item.name || 'Gift Idea')}
              </div>
              ${
                item.description
                  ? `<div style="font-size:13px;color:#57685d;margin-top:4px;">Notes: ${escapeHtml(item.description)}</div>`
                  : ''
              }
              ${
                item.url
                  ? `<div style="margin-top:8px;">
                       <a href="${escapeHtml(item.url)}" target="_blank" style="display:inline-block;background-color:#b91c1c;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:6px 12px;border-radius:6px;">
                         View Gift Link &rarr;
                       </a>
                     </div>`
                  : ''
              }
            </td>
          </tr>`
          )
          .join('')
      : `<tr><td style="padding:14px;color:#6b7280;font-style:italic;font-size:14px;">No specific wishlist items entered yet — time to get creative with a surprise!</td></tr>`;

  const spouseTipsHtml =
    spouseTips.length > 0
      ? spouseTips
          .map(
            (item) => `
          <li style="margin-bottom:8px;font-size:14px;color:#1e293b;">
            <strong>${escapeHtml(item.name || 'Spouse Idea')}</strong>
            ${item.description ? ` — <span style="color:#475569;">${escapeHtml(item.description)}</span>` : ''}
            ${
              item.url
                ? ` <a href="${escapeHtml(item.url)}" target="_blank" style="color:#b91c1c;font-weight:700;text-decoration:underline;margin-left:4px;">[Open Link]</a>`
                : ''
            }
          </li>`
          )
          .join('')
      : `<li style="font-size:14px;color:#64748b;font-style:italic;">No extra tips submitted by ${escapeHtml(receiverSpouse?.name || 'their spouse')} this year.</li>`;

  const doNotBuyHtml =
    doNotBuy.length > 0
      ? `<div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:6px;margin-top:20px;">
           <div style="font-size:13px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.5px;">🚫 Please Do Not Buy</div>
           <div style="font-size:14px;color:#7f1d1d;margin-top:4px;font-weight:600;">${doNotBuy.map(escapeHtml).join(' &bull; ')}</div>
         </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Skinner Family Secret Santa ${year}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f1ea;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);border:1px solid #e5e0d5;">
          <!-- Festive Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#143628 0%,#1f4e3b 100%);background-color:#143628;padding:28px 24px;text-align:center;border-bottom:4px solid #b91c1c;">
              <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fcd34d;">🎄 Official Pairing Reveal 🎄</div>
              <h1 style="margin:8px 0 0 0;font-size:26px;color:#ffffff;font-weight:800;">Skinner Family Secret Santa ${year}</h1>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:28px 24px;">
              ${testBanner}

              <p style="margin:0 0 12px 0;font-size:16px;color:#374151;">Hey <strong>${escapeHtml(giver.name)}</strong>,</p>
              <p style="margin:0 0 16px 0;font-size:15px;color:#4b5563;line-height:1.5;">
                The elves have crunched the numbers (and triple-checked the two-year exclusion rules). This Christmas, you are the Secret Santa for:
              </p>

              <!-- Target Reveal Card -->
              <div style="background-color:#fdf8f6;border:2px solid #b91c1c;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#b91c1c;font-weight:700;">Your ${year} Gift Recipient</div>
                <div style="font-size:32px;font-weight:900;color:#143628;margin-top:6px;">🎅 ${escapeHtml(receiver.name)}</div>
              </div>

              <!-- Sizes Row -->
              <div style="margin-top:24px;">
                <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#143628;margin-bottom:10px;">📏 ${escapeHtml(receiver.name)}'s Sizes</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="33%" style="padding-right:6px;">
                      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;">
                        <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;">Shirt</div>
                        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${escapeHtml(receiver.shirtSize || 'N/A')}</div>
                      </div>
                    </td>
                    <td width="33%" style="padding:0 3px;">
                      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;">
                        <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;">Pant</div>
                        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${escapeHtml(receiver.pantSize || 'N/A')}</div>
                      </div>
                    </td>
                    <td width="33%" style="padding-left:6px;">
                      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;">
                        <div style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:700;">Shoe</div>
                        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:4px;">${escapeHtml(receiver.shoeSize || 'N/A')}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Wishlist Section -->
              <div style="margin-top:26px;">
                <div style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#143628;margin-bottom:8px;">✨ ${escapeHtml(receiver.name)}'s Wishlist</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e0d5;border-radius:10px;overflow:hidden;background-color:#fffdf9;">
                  ${wishlistHtml}
                </table>
              </div>

              ${doNotBuyHtml}

              <!-- Spouse Insider Tips -->
              <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-top:22px;">
                <div style="font-size:13px;font-weight:800;text-transform:uppercase;color:#166534;letter-spacing:0.5px;">
                  🕵️ Insider Tips from ${escapeHtml(receiverSpouse?.name || 'Spouse')}
                </div>
                <ul style="margin:10px 0 0 0;padding-left:20px;">
                  ${spouseTipsHtml}
                </ul>
              </div>

              <!-- Official Family Rules -->
              <div style="margin-top:26px;background-color:#f9fafb;border-radius:10px;padding:16px 20px;border:1px solid #e5e7eb;">
                <div style="font-size:13px;font-weight:800;text-transform:uppercase;color:#374151;letter-spacing:0.6px;margin-bottom:8px;">📜 Skinner Secret Santa Rules</div>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#4b5563;line-height:1.6;">
                  <li><strong>$200 budget</strong> (quantity varies).</li>
                  <li><strong>One surprise item must be included</strong> — you choose how much of the budget to dedicate to it!</li>
                  <li>If you somehow end up paired with the same person as the last two years or your significant other, tell Mike immediately.</li>
                  <li>Try your best to get your presents to your recipient's location by <strong>Christmas Eve</strong>.</li>
                  <li>If you're mailing your presents, keep the packaging anonymous!</li>
                  <li>To maintain the integrity of Secret Santa, keep collusion to a minimum.</li>
                  <li>Only buy presents for the person you're matched with — kids play by a very different set of rules :)</li>
                  <li>Oh, and have fun!</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#143628;color:#a7f3d0;text-align:center;padding:16px;font-size:12px;">
              Sent with 🎄 by the Skinner Family Secret Santa Randomizer
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends email via Resend REST API (free 3,000/mo) OR Mailgun REST API (if MAILGUN_API_KEY is configured).
 * If no API key is configured locally, returns { simulated: true } so local testing in VS Code never crashes!
 */
export async function dispatchEmail({ to, subject, html, env = {} }) {
  const fromAddress = env.EMAIL_FROM || 'Skinner Secret Santa <santa@mikeslevine.com>';

  // Option 1: Resend (https://resend.com - 100% Free tier, easiest for Cloudflare)
  if (env.RESEND_API_KEY) {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Resend API error (${resp.status}): ${errText}`);
    }
    const data = await resp.json();
    return { provider: 'resend', simulated: false, id: data.id };
  }

  // Option 2: Mailgun REST API (if you want to reuse your existing Mailgun keys)
  if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    const formData = new URLSearchParams();
    formData.append('from', fromAddress);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', html);

    const auth = typeof btoa === 'function'
      ? btoa(`api:${env.MAILGUN_API_KEY}`)
      : Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64');

    const resp = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Mailgun API error (${resp.status}): ${errText}`);
    }
    return { provider: 'mailgun', simulated: false };
  }

  // Local Dev Fallback (when running in VS Code / Visual Studio without API keys set yet)
  return {
    provider: 'local-preview',
    simulated: true,
    note: 'No RESEND_API_KEY or MAILGUN_API_KEY set in environment; email was simulated locally.'
  };
}
