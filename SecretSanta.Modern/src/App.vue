<template>
  <div class="min-h-screen bg-[#f6f3ec] text-slate-800 pb-24">
    <!-- Festive Header Banner -->
    <header class="bg-gradient-to-r from-[#112e21] via-[#184330] to-[#112e21] text-white border-b-4 border-red-700 shadow-lg">
      <div class="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-center sm:text-left">
          <div class="text-4xl select-none">🎅</div>
          <div>
            <div class="text-xs font-bold uppercase tracking-widest text-amber-300">
              Official Family Gift Exchange
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Skinner Family Secret Santa {{ activeYear }}
            </h1>
          </div>
        </div>

        <div v-if="currentUser" class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-bold text-white">{{ currentUser.name }}</div>
            <div class="text-xs text-emerald-200">{{ currentUser.email }}</div>
          </div>

          <div v-if="isAdmin" class="flex bg-[#0c2118] p-1 rounded-lg border border-emerald-700/60">
            <button
              @click="activeTab = 'wishlist'"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-bold transition',
                activeTab === 'wishlist'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-200 hover:text-white'
              ]"
            >
              🎁 My Wishlist
            </button>
            <button
              @click="switchToAdmin"
              :class="[
                'px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1',
                activeTab === 'admin'
                  ? 'bg-red-700 text-white shadow'
                  : 'text-amber-300 hover:text-white'
              ]"
            >
              ⚡ Admin Portal
            </button>
          </div>

          <button
            @click="logout"
            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>

    <!-- Toast Notification -->
    <transition name="fade">
      <div
        v-if="toast.message"
        :class="[
          'fixed top-5 right-5 z-50 max-w-md px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 font-semibold text-sm',
          toast.type === 'error'
            ? 'bg-red-900 text-white border-red-700'
            : 'bg-[#143628] text-white border-emerald-500'
        ]"
      >
        <span>{{ toast.type === 'error' ? '⚠️' : '✅' }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- MAIN CONTENT -->
    <main class="max-w-5xl mx-auto px-4 pt-8">
      <!-- VIEW 1: EMAIL LOGIN GATE -->
      <div v-if="!currentUser" class="max-w-md mx-auto mt-6">
        <div class="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          <div class="bg-[#143628] px-6 py-5 text-white text-center border-b-2 border-red-700">
            <div class="text-3xl mb-1">🎄</div>
            <h2 class="text-xl font-bold">Enter Your Email to Begin</h2>
            <p class="text-xs text-emerald-200 mt-1">
              Just enter your email address to view or update your {{ activeYear }} wishlist.
            </p>
          </div>

          <form @submit.prevent="handleLogin" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Family Email Address
              </label>
              <input
                v-model="loginEmail"
                type="email"
                required
                placeholder="e.g. you@example.com"
                class="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-[#143628] focus:ring-2 focus:ring-[#143628]/20 outline-none text-base"
              />
            </div>

            <div
              v-if="loginError"
              class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
            >
              {{ loginError }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3.5 px-6 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold text-base shadow-md transition cursor-pointer"
            >
              {{ loading ? 'Loading Your List...' : 'Open My Secret Santa List →' }}
            </button>
          </form>

          <!-- Local Dev Quick-Login Helper (Only visible on localhost for easy testing) -->
          <div v-if="isLocalhost" class="bg-stone-50 px-6 py-4 border-t border-stone-200">
            <div class="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
              🛠️ Local Dev Quick-Switch (Localhost Only)
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="quick in quickLogins"
                :key="quick.email"
                type="button"
                @click="quickSignIn(quick.email)"
                class="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-stone-300 hover:border-red-600 hover:text-red-700 transition"
              >
                {{ quick.name }}{{ quick.isAdmin ? ' (Admin)' : '' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 2: MEMBER WISHLIST EDITOR -->
      <div v-else-if="activeTab === 'wishlist'" class="space-y-6">
          <!-- Welcome Banner -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 mb-2">
                      <span>✨ Updating for Christmas {{ activeYear }}</span>
                      <span v-if="currentUser.updatedYear === activeYear" class="text-emerald-700">• Saved for {{ activeYear }}</span>
                      <span v-else class="text-amber-700">• Pre-filled with your {{ currentUser.updatedYear || 2025 }} items</span>
                  </div>
                  <h2 class="text-2xl font-extrabold text-slate-900">
                      Hey {{ currentUser.name }}! Here is your Secret Santa Questionnaire
                  </h2>
                  <p class="text-sm text-slate-600 mt-1">
                      Update your sizes, wishlist links, and secret hints for <strong>{{ spouseInfo?.name || 'your spouse' }}'s</strong> Secret Santa below.
                  </p>
              </div>
              <button @click="saveMemberProfile"
                      :disabled="saving"
                      class="shrink-0 px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold shadow-md transition cursor-pointer">
                  {{ saving ? 'Saving...' : '💾 Save My List' }}
              </button>
          </div>

          <!-- Section 0: Required Shipping Address -->
          <section :class="[
            'bg-white rounded-2xl p-6 shadow-sm border transition',
            addressMissingError ? 'border-2 border-red-600 bg-red-50/20' : 'border-stone-200'
          ]">
              <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-extrabold text-[#143628] flex items-center gap-2">
                      <span>📦</span> Shipping Address &amp; Delivery Instructions
                      <span class="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800">
                          Required
                      </span>
                  </h3>
              </div>
              <p class="text-xs text-slate-500 mb-3">
                  Enter your full mailing address. If you have different addresses for <strong>USPS vs. UPS/FedEx</strong> or gate/porch instructions, list them all here!
              </p>
              <textarea v-model="form.shippingAddress"
                        rows="3"
                        required
                        @input="addressMissingError = false"
                        placeholder="e.g. 123 Main St, Cranford, NJ 07016 (or separate USPS PO Box vs. UPS/FedEx physical address)"
                        :class="[
              'w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm leading-relaxed',
              addressMissingError
                ? 'border-red-600 focus:border-red-700 bg-white'
                : 'border-stone-300 focus:border-[#143628]'
            ]"></textarea>
              <p v-if="addressMissingError" class="text-xs font-bold text-red-700 mt-1.5">
                  ⚠️ Please enter your shipping address before saving your questionnaire.
              </p>
          </section>

          <!-- Section 1: Sizes -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <h3 class="text-lg font-extrabold text-[#143628] flex items-center gap-2 mb-4">
                  <span>📏</span> How Do You Measure Up? (Sizes)
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                      <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Shirt Size</label>
                      <input v-model="form.shirtSize"
                             type="text"
                             placeholder="e.g. Medium, L Tall"
                             class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#143628] outline-none text-sm" />
                  </div>
                  <div>
                      <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Pant Size</label>
                      <input v-model="form.pantSize"
                             type="text"
                             placeholder="e.g. 32x32, 4 or 26"
                             class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#143628] outline-none text-sm" />
                  </div>
                  <div>
                      <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Shoe Size</label>
                      <input v-model="form.shoeSize"
                             type="text"
                             placeholder="e.g. 10.5, 7 Wide"
                             class="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#143628] outline-none text-sm" />
                  </div>
              </div>
          </section>

          <!-- Section 2: Wishlist Items -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                      <h3 class="text-lg font-extrabold text-[#143628] flex items-center gap-2">
                          <span>🎁</span> What's on Your {{ activeYear }} Wishlist?
                      </h3>
                      <p class="text-xs text-slate-500 mt-0.5">
                          Add specific items, colors/sizes, and product links (Amazon, Home Depot, Etsy, etc.).
                      </p>
                  </div>
                  <div class="flex items-center gap-2">
                      <button type="button"
                              @click="clearWishlistItems"
                              class="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-slate-600 transition">
                          🧹 Clear Old Items
                      </button>
                      <button type="button"
                              @click="addWishlistItem"
                              class="px-3.5 py-1.5 rounded-lg bg-[#143628] hover:bg-[#1d4d39] text-white text-xs font-bold transition">
                          + Add Gift Idea
                      </button>
                  </div>
              </div>

              <div v-if="form.favoriteThings.length === 0" class="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <p class="text-sm text-slate-600 font-medium">Your wishlist is currently empty.</p>
                  <button type="button"
                          @click="addWishlistItem"
                          class="mt-3 px-4 py-2 rounded-lg bg-[#143628] text-white text-xs font-bold">
                      + Add Your First Gift Idea
                  </button>
              </div>

              <div class="space-y-3">
                  <div v-for="(item, idx) in form.favoriteThings"
                       :key="idx"
                       class="p-4 rounded-xl bg-stone-50/80 border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div class="sm:col-span-4">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Item Name</label>
                          <input v-model="item.name"
                                 type="text"
                                 placeholder="e.g. Flamingo Estate Candle"
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm" />
                      </div>
                      <div class="sm:col-span-3">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Color / Size / Notes</label>
                          <input v-model="item.description"
                                 type="text"
                                 placeholder="e.g. Size M, Black"
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm" />
                      </div>
                      <div class="sm:col-span-4">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Product Link (URL)</label>
                          <input v-model="item.url"
                                 type="text"
                                 placeholder="https://..."
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm" />
                      </div>
                      <div class="sm:col-span-1 flex sm:justify-end sm:pt-6">
                          <button type="button"
                                  @click="form.favoriteThings.splice(idx, 1)"
                                  class="px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold"
                                  title="Remove item">
                              ✕
                          </button>
                      </div>
                  </div>
              </div>
          </section>

          <!-- Section 3: Do Not Buy -->
          <section class="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <div class="flex items-center justify-between mb-3">
                  <div>
                      <h3 class="text-lg font-extrabold text-red-800 flex items-center gap-2">
                          <span>🚫</span> Please Do Not Buy Me
                      </h3>
                      <p class="text-xs text-slate-500">
                          Anything you already have too much of (e.g., Booze, Drinkware, Clothing, Candles).
                      </p>
                  </div>
                  <button type="button"
                          @click="form.doNotBuy.push('')"
                          class="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition">
                      + Add Item
                  </button>
              </div>

              <div v-if="form.doNotBuy.length === 0" class="text-xs text-slate-400 italic">
                  No "Do Not Buy" restrictions added.
              </div>

              <div class="flex flex-wrap gap-2 mt-2">
                  <div v-for="(dnb, idx) in form.doNotBuy"
                       :key="idx"
                       class="flex items-center gap-1 bg-red-50/70 border border-red-200 rounded-xl px-3 py-1.5">
                      <input v-model="form.doNotBuy[idx]"
                             type="text"
                             placeholder="e.g. Drinkware"
                             class="bg-transparent text-sm font-medium text-red-950 outline-none w-36" />
                      <button type="button"
                              @click="form.doNotBuy.splice(idx, 1)"
                              class="text-red-500 hover:text-red-800 font-bold text-xs ml-1">
                          ✕
                      </button>
                  </div>
              </div>
          </section>

          <!-- Section 4: Spouse Insider Suggestions -->
          <section class="bg-emerald-950/5 rounded-2xl p-6 shadow-sm border-2 border-emerald-800/20">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                      <h3 class="text-lg font-extrabold text-[#143628] flex items-center gap-2">
                          <span>🕵️</span> Secret Insider Hints for {{ spouseInfo?.name || 'Your Spouse' }}'s Santa
                      </h3>
                      <p class="text-xs text-slate-600 mt-0.5">
                          Anything you enter here will automatically be sent to <strong>whoever draws {{ spouseInfo?.name || 'your spouse' }}</strong> (and {{ spouseInfo?.name || 'your spouse' }} won't see it!).
                      </p>
                  </div>
                  <button type="button"
                          @click="form.suggestionsForSpouse.push({ name: '', description: '', url: '' })"
                          class="px-3.5 py-1.5 rounded-lg bg-[#143628] hover:bg-[#1d4d39] text-white text-xs font-bold transition shrink-0">
                      + Add Hint for {{ spouseInfo?.name || 'Spouse' }}
                  </button>
              </div>

              <div v-if="form.suggestionsForSpouse.length === 0" class="text-xs text-slate-500 italic">
                  No secret hints entered for {{ spouseInfo?.name || 'your spouse' }} yet.
              </div>

              <div class="space-y-3">
                  <div v-for="(tip, idx) in form.suggestionsForSpouse"
                       :key="idx"
                       class="p-4 rounded-xl bg-white border border-emerald-800/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div class="sm:col-span-4">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Idea for {{ spouseInfo?.name }}</label>
                          <input v-model="tip.name"
                                 type="text"
                                 placeholder="e.g. Audible Gift Card"
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
                      </div>
                      <div class="sm:col-span-3">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Details / Size</label>
                          <input v-model="tip.description"
                                 type="text"
                                 placeholder="e.g. Size L, Navy"
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
                      </div>
                      <div class="sm:col-span-4">
                          <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Link (Optional)</label>
                          <input v-model="tip.url"
                                 type="text"
                                 placeholder="https://..."
                                 class="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
                      </div>
                      <div class="sm:col-span-1 flex sm:justify-end sm:pt-6">
                          <button type="button"
                                  @click="form.suggestionsForSpouse.splice(idx, 1)"
                                  class="px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold">
                              ✕
                          </button>
                      </div>
                  </div>
              </div>
          </section>

          <!-- Bottom Save Bar -->
          <div class="flex justify-end">
              <button @click="saveMemberProfile"
                      :disabled="saving"
                      class="px-8 py-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-base shadow-lg transition cursor-pointer">
                  {{ saving ? 'Saving...' : '💾 Save My List' }}
              </button>
          </div>
      </div>

      <!-- VIEW 3: ADMIN PORTAL (me@mikeslevine.com ONLY) -->
      <div v-else-if="activeTab === 'admin' && isAdmin && adminState" class="space-y-8">
        <!-- Admin Hero Control Panel -->
        <div class="bg-white rounded-2xl p-6 shadow-md border-2 border-[#143628]">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
                ⚡ Commissioner Control Panel ({{ adminState.activeYear }} Season)
              </div>
              <h2 class="text-2xl font-extrabold text-slate-900">
                Randomizer &amp; Family Readiness Dashboard
              </h2>
              <p class="text-sm text-slate-600 mt-1">
                <strong>{{ updatedCount }} of {{ adminState.members.length }}</strong> family members have explicitly saved their {{ adminState.activeYear }} wishlist.
                All exclusions are pre-loaded from <code class="bg-stone-100 px-1.5 py-0.5 rounded text-xs">members_2026.json</code>.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                @click="runDraw(true)"
                :disabled="drawRunning"
                class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow transition cursor-pointer"
              >
                🎲 Dry Run (Test Draw &amp; Email Mike)
              </button>
              <button
                @click="confirmOfficialDraw"
                :disabled="drawRunning"
                class="px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
              >
                🎄 Run Official {{ adminState.activeYear }} Draw &amp; Email All
              </button>
            </div>
          </div>

          <!-- Latest Draw Result Output -->
          <div
            v-if="lastDrawResult"
            class="mt-6 p-5 rounded-xl bg-stone-50 border border-stone-300 space-y-3"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-extrabold text-sm uppercase tracking-wider text-[#143628]">
                {{ lastDrawResult.isTest ? '🧪 Dry Run Test Pairings (History Not Modified)' : '🎉 Official Draw Pairings Locked & Sent!' }}
              </h4>
              <button
                @click="lastDrawResult = null"
                class="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Dismiss ✕
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div
                v-for="pair in lastDrawResult.pairings"
                :key="pair.giverId"
                class="p-3 rounded-lg bg-white border border-stone-200 flex items-center justify-between text-sm"
              >
                <span class="font-bold text-slate-800">{{ pair.giverName }}</span>
                <span class="text-slate-400">➔</span>
                <span class="font-extrabold text-red-700">{{ pair.receiverName }}</span>
                <button
                  @click="previewPairingEmail(pair.giverId, pair.receiverId, lastDrawResult.isTest)"
                  class="text-[11px] font-bold text-emerald-800 underline ml-1"
                  title="Preview exact HTML email"
                >
                  View Email
                </button>
              </div>
            </div>

            <div class="text-xs text-slate-600 pt-1">
              <span v-if="lastDrawResult.emailResults?.[0]?.simulated" class="text-amber-800 font-semibold">
                ℹ️ Local Preview Mode: Emails were simulated locally (add <code>RESEND_API_KEY</code> or <code>MAILGUN_API_KEY</code> in <code>.env</code> / Cloudflare to dispatch live emails). Click "View Email" on any card above to inspect the festive HTML email!
              </span>
              <span v-else class="text-emerald-800 font-semibold">
                ✅ {{ lastDrawResult.emailResults?.length }} emails dispatched via {{ lastDrawResult.emailResults?.[0]?.provider }}.
              </span>
            </div>
          </div>
        </div>

        <!-- Family Readiness & Exclusion Matrix Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div class="px-6 py-4 bg-[#143628] text-white flex items-center justify-between">
            <div>
              <h3 class="font-extrabold text-base">
                👨‍👩‍👧‍👦 Family Roster, {{ adminState.activeYear }} Exclusions &amp; Eligibility Matrix
              </h3>
              <p class="text-xs text-emerald-200">
                Automatically blocks Self + Spouse + Last 2 Years. Click "Edit / Inspect" on anyone to tweak their email, exclusions, or wishlist.
              </p>
            </div>
            <button
              @click="resetTo2026Seed"
              class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 border border-white/15 transition"
              title="Reset local database back to initial 2026 seed state"
            >
              ↺ Reset to 2026 Seed
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-stone-100 text-slate-600 text-xs uppercase border-b border-stone-200">
                  <th class="py-3 px-4">Member</th>
                  <th class="py-3 px-4">Spouse</th>
                  <th class="py-3 px-4">Cannot Get ({{ adminState.activeYear }} Ineligible)</th>
                  <th class="py-3 px-4">Eligible Pool ({{ adminState.activeYear }})</th>
                  <th class="py-3 px-4">Wishlist Status</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200">
                <tr
                  v-for="m in adminState.members"
                  :key="m.id"
                  class="hover:bg-stone-50/80 transition"
                >
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-900">{{ m.name }}</div>
                    <div class="text-xs text-slate-500">{{ m.email }}</div>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-700">
                    {{ getMemberName(m.spouseId) }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="exId in m.ineligible"
                        :key="exId"
                        :class="[
                          'px-2 py-0.5 rounded-md text-xs font-bold',
                          exId === m.spouseId
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-red-100 text-red-900'
                        ]"
                      >
                        🚫 {{ getMemberName(exId) }}{{ exId === m.spouseId ? ' (Spouse)' : '' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="elId in getEligibleIds(m)"
                        :key="elId"
                        class="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        ✓ {{ getMemberName(elId) }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      v-if="m.updatedYear === adminState.activeYear"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900"
                    >
                      ✅ Updated ({{ m.favoriteThings?.length || 0 }} items)
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900"
                    >
                      ⏳ Carrying {{ m.updatedYear || 2025 }} ({{ m.favoriteThings?.length || 0 }} items)
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right space-x-2">
                    <button
                      @click="previewPairingEmail(1, m.id, true)"
                      class="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-slate-700"
                    >
                      ✉️ Preview Card
                    </button>
                    <button
                      @click="openAdminEditModal(m)"
                      class="px-3 py-1 rounded-lg bg-[#143628] hover:bg-[#1e4d38] text-white text-xs font-bold"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Past Draw History Log -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <h3 class="font-extrabold text-base text-[#143628] mb-3">
            📜 Rolling Draw History (Used for Automatic 2-Year Exclusions)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="hist in [...(adminState.history || [])].reverse()"
              :key="hist.year"
              class="p-4 rounded-xl bg-stone-50 border border-stone-200"
            >
              <div class="font-extrabold text-sm text-slate-800 mb-2">
                🎄 Christmas {{ hist.year }} Pairings
              </div>
              <div class="grid grid-cols-2 gap-1.5 text-xs">
                <div
                  v-for="p in hist.pairings"
                  :key="p.giverId"
                  class="bg-white px-2.5 py-1.5 rounded border border-stone-200 flex justify-between"
                >
                  <span class="font-semibold">{{ getMemberName(p.giverId) }}</span>
                  <span class="text-slate-400">➔</span>
                  <span class="font-bold text-red-700">{{ getMemberName(p.receiverId) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL 1: ADMIN EDIT MEMBER & EXCLUSIONS -->
    <div
      v-if="editingMember"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
        <div class="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 class="text-lg font-extrabold text-[#143628]">
            Edit {{ editingMember.name }} (ID #{{ editingMember.id }})
          </h3>
          <button @click="editingMember = null" class="text-slate-400 hover:text-slate-700 font-bold">
            ✕
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Name</label>
            <input
              v-model="editingMember.name"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Email</label>
            <input
              v-model="editingMember.email"
              type="email"
              class="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1.5">
            Ineligible Recipients (Cannot Draw in {{ adminState.activeYear }})
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label
              v-for="candidate in adminState.members.filter((x) => x.id !== editingMember.id)"
              :key="candidate.id"
              :class="[
                'flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer',
                editingMember.ineligible.includes(candidate.id)
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-stone-50 border-stone-200 text-slate-700'
              ]"
            >
              <input
                type="checkbox"
                :value="candidate.id"
                v-model="editingMember.ineligible"
                :disabled="candidate.id === editingMember.spouseId"
              />
              <span>{{ candidate.name }}{{ candidate.id === editingMember.spouseId ? ' (Spouse)' : '' }}</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-stone-200">
          <button
            type="button"
            @click="impersonateMember(editingMember)"
            class="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-slate-700"
          >
            ✏️ Open {{ editingMember.name }}'s Full Wishlist Editor
          </button>
          <div class="flex gap-2">
            <button
              type="button"
              @click="editingMember = null"
              class="px-4 py-2 rounded-lg border border-stone-300 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveAdminMemberEdit"
              class="px-5 py-2 rounded-lg bg-[#143628] text-white text-xs font-bold"
            >
              Save Member
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 2: FESTIVE EMAIL HTML PREVIEWER -->
    <div
      v-if="emailPreviewHtml"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div class="px-5 py-3.5 bg-[#143628] text-white flex items-center justify-between">
          <div class="font-bold text-sm">
            ✉️ Festive Email Preview (Exact HTML Sent to Secret Santa)
          </div>
          <button
            @click="emailPreviewHtml = ''"
            class="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
          >
            Close Preview ✕
          </button>
        </div>
        <iframe
          :srcdoc="emailPreviewHtml"
          class="w-full flex-1 border-0 bg-[#f4f1ea]"
          title="Festive Email Preview"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

const activeYear = ref(2026);
const loginEmail = ref('');
const loginError = ref('');
const loading = ref(false);
const saving = ref(false);
const drawRunning = ref(false);

const currentUser = ref(null);
const spouseInfo = ref(null);
const isAdmin = ref(false);
const activeTab = ref('wishlist');
const adminState = ref(null);
const lastDrawResult = ref(null);
const editingMember = ref(null);
const emailPreviewHtml = ref('');

const toast = reactive({ message: '', type: 'success' });
const addressMissingError = ref(false);

const form = reactive({
  shippingAddress: '',
  pantSize: '',
  shirtSize: '',
  shoeSize: '',
  favoriteThings: [],
  doNotBuy: [],
  suggestionsForSpouse: []
});

const isLocalhost = computed(() => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
});

const quickLogins = [
  { name: 'Mike', email: 'me@mikeslevine.com', isAdmin: true },
  { name: 'Corri', email: 'corri.skinner@gmail.com' },
  { name: 'Vicki', email: 'skinnerv@pa.metrocast.net' },
  { name: 'Larry', email: 'skindc@pa.metrocast.net' },
  { name: 'Cassie', email: 'cassie11r@hotmail.com' },
  { name: 'Fritz', email: 'fritz.mavencamp@cpsagu.com' },
  { name: 'Sara', email: 'sara.skinner7@gmail.com' },
  { name: 'Phil', email: 'phil.a.lindeman@gmail.com' }
];

const updatedCount = computed(() => {
  if (!adminState.value?.members) return 0;
  return adminState.value.members.filter(
    (m) => m.updatedYear === adminState.value.activeYear
  ).length;
});

function showToast(message, type = 'success') {
  toast.message = message;
  toast.type = type;
  setTimeout(() => {
    if (toast.message === message) toast.message = '';
  }, 4000);
}

function populateFormFromMember(member) {
  addressMissingError.value = false;
  form.shippingAddress = member.shippingAddress || '';
  form.pantSize = member.pantSize || '';
  form.shirtSize = member.shirtSize || '';
  form.shoeSize = member.shoeSize || '';
  form.favoriteThings =
    member.favoriteThings?.length > 0
      ? JSON.parse(JSON.stringify(member.favoriteThings))
      : [{ name: '', description: '', url: '' }];
  form.doNotBuy = member.doNotBuy ? [...member.doNotBuy] : [];
  form.suggestionsForSpouse =
    member.suggestionsForSpouse?.length > 0
      ? JSON.parse(JSON.stringify(member.suggestionsForSpouse))
      : [];
}

async function handleLogin() {
  loginError.value = '';
  loading.value = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail.value })
    });
    const data = await res.json();
    if (!res.ok) {
      loginError.value = data.error || 'Could not sign in with that email.';
      return;
    }

    activeYear.value = data.activeYear;
    currentUser.value = data.member;
    spouseInfo.value = data.spouse;
    isAdmin.value = data.isAdmin;
    if (data.allState) {
      adminState.value = data.allState;
    }
    populateFormFromMember(data.member);
    localStorage.setItem('skinner_santa_email', data.member.email);
  } catch (err) {
    loginError.value = 'Network error connecting to Secret Santa server.';
  } finally {
    loading.value = false;
  }
}

function quickSignIn(email) {
  loginEmail.value = email;
  handleLogin();
}

function logout() {
  currentUser.value = null;
  spouseInfo.value = null;
  isAdmin.value = false;
  activeTab.value = 'wishlist';
  localStorage.removeItem('skinner_santa_email');
}

function addWishlistItem() {
  form.favoriteThings.push({ name: '', description: '', url: '' });
}

function clearWishlistItems() {
  form.favoriteThings = [{ name: '', description: '', url: '' }];
  showToast('Cleared last year items — ready for your fresh wishlist!');
}

async function saveMemberProfile() {
  if (!currentUser.value) return;
  if (!form.shippingAddress || !form.shippingAddress.trim()) {
    addressMissingError.value = true;
    showToast('Please enter your shipping address / delivery instructions first!', 'error');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  saving.value = true;
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentUser.value.id,
        shippingAddress: form.shippingAddress,
        pantSize: form.pantSize,
        shirtSize: form.shirtSize,
        shoeSize: form.shoeSize,
        favoriteThings: form.favoriteThings,
        doNotBuy: form.doNotBuy,
        suggestionsForSpouse: form.suggestionsForSpouse
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save');

    currentUser.value = data.member;
    if (isAdmin.value && data.allState) {
      adminState.value = data.allState;
    }
    populateFormFromMember(data.member);
    showToast(`Saved ${currentUser.value.name}'s ${activeYear.value} Secret Santa list!`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saving.value = false;
  }
}

async function switchToAdmin() {
  activeTab.value = 'admin';
  const res = await fetch('/api/state');
  if (res.ok) {
    adminState.value = await res.json();
  }
}

function getMemberName(id) {
  const m = adminState.value?.members?.find((x) => x.id === id);
  return m ? m.name : `#${id}`;
}

function getEligibleIds(member) {
  if (!adminState.value?.members) return [];
  const blocked = new Set([member.id, member.spouseId, ...(member.ineligible || [])]);
  return adminState.value.members
    .map((m) => m.id)
    .filter((id) => !blocked.has(id));
}

function openAdminEditModal(member) {
  editingMember.value = JSON.parse(JSON.stringify(member));
}

async function saveAdminMemberEdit() {
  if (!editingMember.value) return;
  const res = await fetch('/api/admin/member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editingMember.value)
  });
  const data = await res.json();
  if (res.ok) {
    adminState.value = data.state;
    editingMember.value = null;
    showToast('Updated family member settings!');
  } else {
    showToast(data.error || 'Error updating member', 'error');
  }
}

function impersonateMember(member) {
  editingMember.value = null;
  currentUser.value = member;
  spouseInfo.value = adminState.value.members.find((m) => m.id === member.spouseId) || null;
  populateFormFromMember(member);
  activeTab.value = 'wishlist';
  showToast(`Now editing ${member.name}'s wishlist directly`);
}

async function previewPairingEmail(giverId, receiverId, isTest = true) {
  const res = await fetch('/api/admin/preview-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ giverId, receiverId, isTest })
  });
  const data = await res.json();
  if (res.ok) {
    emailPreviewHtml.value = data.html;
  }
}

async function runDraw(isTest) {
  drawRunning.value = true;
  try {
    const res = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTest, sendEmails: true })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Draw failed');

    lastDrawResult.value = data;
    adminState.value = data.state;
    activeYear.value = data.state.activeYear;
    showToast(
      isTest
        ? 'Dry Run complete! Test pairings generated below.'
        : 'Official Draw complete! Emails dispatched & next year exclusions updated!'
    );
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    drawRunning.value = false;
  }
}

function confirmOfficialDraw() {
  const ok = window.confirm(
    `Run the OFFICIAL ${adminState.value.activeYear} Skinner Family Secret Santa Draw?

This will email all 8 family members their matches and roll the 2-year exclusions forward for ${adminState.value.activeYear + 1}.`
  );
  if (ok) {
    runDraw(false);
  }
}

async function resetTo2026Seed() {
  const ok = window.confirm(
    'Reset the database back to the clean 2026 starting state (from members_2026.json)?'
  );
  if (!ok) return;
  const res = await fetch('/api/admin/reset-seed', { method: 'POST' });
  const data = await res.json();
  if (res.ok) {
    adminState.value = data.state;
    activeYear.value = data.state.activeYear;
    lastDrawResult.value = null;
    showToast('Database reset to clean 2026 seed state!');
  }
}

onMounted(async () => {
  const savedEmail = localStorage.getItem('skinner_santa_email');
  if (savedEmail) {
    loginEmail.value = savedEmail;
    await handleLogin();
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
