import { SEED_STATE } from '../../src/shared/seedData.js';
import { handleApiRequest } from '../../src/shared/apiRouter.js';

const KV_KEY = 'santa_state_v1';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
        try {
            body = await request.json();
        } catch {
            body = {};
        }
    }

    // Fail loudly if SANTA_KV is not bound to this Cloudflare environment
    if (!env.SANTA_KV) {
        return new Response(
            JSON.stringify({
                error:
                    'Cloudflare KV binding "SANTA_KV" is missing on this environment. Check Settings -> Bindings in Cloudflare Pages (enable for both Production & Preview) and redeploy.'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    async function getState() {
        const raw = await env.SANTA_KV.get(KV_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
        const initial = JSON.parse(JSON.stringify(SEED_STATE));
        await env.SANTA_KV.put(KV_KEY, JSON.stringify(initial));
        return initial;
    }

    async function saveState(newState) {
        await env.SANTA_KV.put(KV_KEY, JSON.stringify(newState));
    }

    try {
        const result = await handleApiRequest({
            method,
            path,
            body,
            getState,
            saveState,
            env
        });

        return new Response(JSON.stringify(result.data), {
            status: result.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}