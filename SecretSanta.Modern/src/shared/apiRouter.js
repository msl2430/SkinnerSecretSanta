import { SEED_STATE } from './seedData.js';
import {
  normalizeGiftItems,
  solveSecretSantaDraw,
  buildFestiveEmailHtml,
  dispatchEmail
} from './santaCore.js';

export const ADMIN_EMAIL = 'me@mikeslevine.com';

export function findMemberByEmail(members, rawEmail) {
  const clean = (rawEmail || '').trim().toLowerCase();
  if (!clean) return null;
  return (
    members.find(
      (m) =>
        m.email.toLowerCase() === clean ||
        (Array.isArray(m.altEmails) && m.altEmails.some((a) => a.toLowerCase() === clean))
    ) || null
  );
}

export async function handleApiRequest({ method, path, body, getState, saveState, env }) {
  const state = await getState();

  // GET /api/state (Admin or initial metadata)
  if (method === 'GET' && path === '/api/state') {
    return { status: 200, data: state };
  }

  // POST /api/login
  if (method === 'POST' && path === '/api/login') {
    const member = findMemberByEmail(state.members, body?.email);
    if (!member) {
      return {
        status: 403,
        data: {
          error:
            'That email address is not on the Skinner Family Secret Santa roster. Try your primary family email!'
        }
      };
    }

    const spouse = state.members.find((m) => m.id === member.spouseId) || null;
    const isAdmin =
      member.email.toLowerCase() === ADMIN_EMAIL ||
      (body?.email || '').trim().toLowerCase() === ADMIN_EMAIL;

    return {
      status: 200,
      data: {
        activeYear: state.activeYear,
        member,
        spouse: spouse ? { id: spouse.id, name: spouse.name, email: spouse.email } : null,
        isAdmin,
        allState: isAdmin ? state : null
      }
    };
  }

  // POST /api/save (Member saves their own wishlist, sizes, doNotBuy, and suggestionsForSpouse)
  if (method === 'POST' && path === '/api/save') {
    const memberId = Number(body?.id);
    const idx = state.members.findIndex((m) => m.id === memberId);
    if (idx === -1) {
      return { status: 404, data: { error: 'Member not found' } };
    }

    const existing = state.members[idx];
    const shippingAddress = (body.shippingAddress ?? existing.shippingAddress ?? '').trim();

    if (!shippingAddress) {
        return {
            status: 400,
            data: { error: 'Please enter your shipping address / delivery instructions before saving.' }
        };
    }
    const updatedMember = {
      ...existing,
      shippingAddress,
      pantSize: (body.pantSize ?? existing.pantSize ?? '').trim(),
      shirtSize: (body.shirtSize ?? existing.shirtSize ?? '').trim(),
      shoeSize: (body.shoeSize ?? existing.shoeSize ?? '').trim(),
      favoriteThings: normalizeGiftItems(body.favoriteThings || []),
      doNotBuy: Array.isArray(body.doNotBuy)
        ? body.doNotBuy.map((s) => String(s).trim()).filter(Boolean)
        : [],
      suggestionsForSpouse: normalizeGiftItems(body.suggestionsForSpouse || []),
      updatedYear: state.activeYear
    };

    state.members[idx] = updatedMember;
    await saveState(state);

    return {
      status: 200,
      data: {
        ok: true,
        member: updatedMember,
        allState: state
      }
    };
  }

  // POST /api/admin/member (Admin edits any member's email, exclusions, or wishlist)
  if (method === 'POST' && path === '/api/admin/member') {
    const memberId = Number(body?.id);
    const idx = state.members.findIndex((m) => m.id === memberId);
    if (idx === -1) {
      return { status: 404, data: { error: 'Member not found' } };
    }

    const existing = state.members[idx];
    const cleanIneligible = Array.isArray(body.ineligible)
      ? [...new Set(body.ineligible.map(Number).filter((n) => n && n !== existing.id))]
      : existing.ineligible;

    // Ensure spouseId is always first in ineligible
    if (!cleanIneligible.includes(existing.spouseId)) {
      cleanIneligible.unshift(existing.spouseId);
    }

    state.members[idx] = {
      ...existing,
      name: (body.name ?? existing.name).trim(),
      email: (body.email ?? existing.email).trim(),
      shippingAddress: (body.shippingAddress ?? existing.shippingAddress ?? '').trim(),
      pantSize: (body.pantSize ?? existing.pantSize ?? '').trim(),
      shirtSize: (body.shirtSize ?? existing.shirtSize ?? '').trim(),
      shoeSize: (body.shoeSize ?? existing.shoeSize ?? '').trim(),
      ineligible: cleanIneligible,
      favoriteThings: body.favoriteThings
        ? normalizeGiftItems(body.favoriteThings)
        : existing.favoriteThings,
      doNotBuy: Array.isArray(body.doNotBuy)
        ? body.doNotBuy.map((s) => String(s).trim()).filter(Boolean)
        : existing.doNotBuy,
      suggestionsForSpouse: body.suggestionsForSpouse
        ? normalizeGiftItems(body.suggestionsForSpouse)
        : existing.suggestionsForSpouse,
      updatedYear: body.markUpdated ? state.activeYear : existing.updatedYear
    };

    await saveState(state);
    return { status: 200, data: { ok: true, state } };
  }

  // POST /api/admin/preview-email (Returns rendered HTML email for any Giver -> Receiver pair)
  if (method === 'POST' && path === '/api/admin/preview-email') {
    const giver = state.members.find((m) => m.id === Number(body?.giverId)) || state.members[0];
    const receiver =
      state.members.find((m) => m.id === Number(body?.receiverId)) || state.members[1];

    const html = buildFestiveEmailHtml({
      giver,
      receiver,
      allMembers: state.members,
      year: state.activeYear,
      isTest: Boolean(body?.isTest)
    });

    return { status: 200, data: { html } };
  }

  // POST /api/admin/draw (Runs the solver; either Dry Run -> me@mikeslevine.com or Official Draw -> everyone + roll exclusions)
  if (method === 'POST' && path === '/api/admin/draw') {
    const isTest = Boolean(body?.isTest);
    const sendEmails = body?.sendEmails !== false;

    let pairings;
    try {
      pairings = solveSecretSantaDraw(state.members);
    } catch (err) {
      return { status: 400, data: { error: err.message } };
    }

    const emailResults = [];
    if (sendEmails) {
      for (const pair of pairings) {
        const giver = state.members.find((m) => m.id === pair.giverId);
        const receiver = state.members.find((m) => m.id === pair.receiverId);
        const targetEmail = isTest ? ADMIN_EMAIL : giver.email;
        const subject = isTest
          ? `🎄 Skinner Secret Santa ${state.activeYear} [TEST for ${giver.name}]`
          : `🎄 Your ${state.activeYear} Skinner Family Secret Santa Pairing!`;

        const html = buildFestiveEmailHtml({
          giver,
          receiver,
          allMembers: state.members,
          year: state.activeYear,
          isTest
        });

        try {
          const delivery = await dispatchEmail({
            to: targetEmail,
            subject,
            html,
            env
          });
          emailResults.push({
            giverName: giver.name,
            receiverName: receiver.name,
            sentTo: targetEmail,
            ...delivery
          });
        } catch (emailErr) {
          emailResults.push({
            giverName: giver.name,
            receiverName: receiver.name,
            sentTo: targetEmail,
            error: emailErr.message
          });
        }
      }
    }

    // If Official Draw (not a test), record history and automatically roll exclusions forward for next year!
    if (!isTest) {
      const currentYear = state.activeYear;
      state.history = [
        ...(state.history || []).filter((h) => h.year !== currentYear),
        {
          year: currentYear,
          timestamp: new Date().toISOString(),
          pairings: pairings.map((p) => ({
            giverId: p.giverId,
            receiverId: p.receiverId
          }))
        }
      ];

      // Roll each member's 2-year exclusion window forward for next year (activeYear + 1):
      // New Ineligible = [spouseId, lastYearReceiverId (2025), thisYearReceiverId (2026)]
      for (const member of state.members) {
        const match = pairings.find((p) => p.giverId === member.id);
        if (match) {
          const prevMostRecent =
            member.history2025ReceiverId ||
            member.ineligible.filter((id) => id !== member.spouseId).slice(-1)[0];

          member.history2024ReceiverId = prevMostRecent;
          member.history2025ReceiverId = match.receiverId;
          member.ineligible = [
            ...new Set([member.spouseId, prevMostRecent, match.receiverId].filter(Boolean))
          ];
        }
      }

      state.lastOfficialDrawYear = currentYear;
      state.activeYear = currentYear + 1;
      await saveState(state);
    }

    return {
      status: 200,
      data: {
        ok: true,
        isTest,
        pairings,
        emailResults,
        state
      }
    };
  }

  // POST /api/admin/reset-seed (Resets state back to clean 2026 seed if needed after testing)
  if (method === 'POST' && path === '/api/admin/reset-seed') {
    const fresh = JSON.parse(JSON.stringify(SEED_STATE));
    await saveState(fresh);
    return { status: 200, data: { ok: true, state: fresh } };
  }

  return { status: 404, data: { error: `Unknown endpoint: ${method} ${path}` } };
}
