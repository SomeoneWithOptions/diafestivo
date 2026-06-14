# Auto-Refresh Implementation Plan

## Context

The main page (`/index.html`) currently fetches the holiday countdown template from `https://api.diafestivo.co/template` **once** when the page loads. The server computes the number of days left to the next Colombia holiday, so the browser itself never has to calculate dates.

Because the value changes once per day (at midnight Colombia time), users who:

- leave the tab open overnight, or
- return to a tab after a day or two

see stale information until they manually refresh.

## Goal

Display the most up-to-date holiday countdown automatically, without requiring the user to refresh. Keep the existing HTML / CSS / vanilla JS stack. Do not require backend changes.

## Recommended approach: client-side polling + visibility refresh

The simplest and most reliable option is to let the browser re-fetch the rendered template on a schedule and when the user returns to the page.

### Why this option

- The current architecture already has the server doing all the date math and rendering.
- No changes are needed on `api.diafestivo.co`.
- Colombia timezone handling stays on the server.
- The update only needs to happen once per day, so "push" technologies (WebSockets, Server-Sent Events) are overkill.

## What to implement

Make the following additions to the script block in `/index.html`:

1. **Periodic re-fetch** while the page is open.
2. **Immediate re-fetch** when the tab becomes visible again after being hidden for a while.
3. **DOM diffing** so the content is only replaced when it actually changed.
4. **Graceful errors during refresh**: don't overwrite working content if a background fetch fails.
5. **Cache-control on refreshes**: use `cache: 'no-store'` on refresh fetches so a stale cached template isn't shown after midnight.

## Suggested configuration

```javascript
const TEMPLATE_URL = 'https://api.diafestivo.co/template';
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;   // 1 hour
const MIN_HIDDEN_TIME_MS = 5 * 60 * 1000;     // 5 minutes
```

These values can be tuned:

- `REFRESH_INTERVAL_MS`: anything from 30 minutes to a few hours is reasonable. Daily resolution means very frequent polling is unnecessary. Suggested start: **60 minutes**.
- `MIN_HIDDEN_TIME_MS`: how long the tab must be hidden before returning triggers an immediate refresh. Suggested start: **5 minutes**. This avoids extra fetches when the user is just switching tabs quickly.

## Proposed code changes

Only `/index.html` needs to change. The existing inline `<script>` block should be updated as follows.

### 1. Extract a `loadTemplate()` helper

```javascript
function loadTemplate(forceFresh = false) {
  const options = forceFresh ? { cache: 'no-store' } : {};

  return fetch(TEMPLATE_URL, options)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(html => {
      const trimmed = html.trim();
      if (c.innerHTML.trim() !== trimmed) {
        c.innerHTML = trimmed;
      }
    })
    .catch(err => {
      console.error('Template refresh failed:', err);
      // Do NOT overwrite existing content on refresh errors.
    });
}
```

Notes:

- Use `cache: 'no-store'` only for refreshes, not the initial page load, so the first load can still benefit from normal HTTP caching.
- `c` is the existing `#main-container` element from the current script.
- The trimmed-HTML comparison prevents unnecessary DOM swaps and stops the fade-in animation from replaying when nothing changes.

### 2. Initial load

Keep the existing initial fetch behavior, but optionally wrap it so the `loadTemplate` helper is reused:

```javascript
const c = document.getElementById('main-container');
const i = document.getElementById('loading');

fetch(TEMPLATE_URL)
  .then(r => r.text())
  .then(t => {
    i.style.display = 'none';
    c.style.display = 'flex';
    c.classList.add('animation__fade-in');
    c.innerHTML = t;
  })
  .catch(t => {
    c.innerHTML = t;
  });
```

The initial load can stay mostly as-is, because it needs to show the loader and play the entrance animation.

### 3. Periodic refresh

```javascript
setInterval(() => loadTemplate(true), REFRESH_INTERVAL_MS);
```

`setInterval` is fine here because the update frequency is low. Modern browsers throttle background tabs, which is fine — the visibility listener below handles the important case of the user coming back.

### 4. Refresh on tab visibility change

```javascript
let hiddenAt = Date.now();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    hiddenAt = Date.now();
  } else {
    const hiddenFor = Date.now() - hiddenAt;
    if (hiddenFor > MIN_HIDDEN_TIME_MS) {
      loadTemplate(true);
    }
  }
});
```

This ensures that if a user leaves the page hidden for hours and comes back, the countdown is refreshed immediately.

### 5. Optional: avoid animation replay on update

The existing `.animation__fade-in` class runs a 1-second fade-in. If it is present on `#main-container` and the HTML is replaced, the class will remain but the animation will play again only if the element is re-created. Because we are setting `innerHTML` on the same element, the animation should not automatically re-trigger in most browsers.

However, if you notice flicker on content change, you can either:

- keep the diff check (recommended), or
- remove the `animation__fade-in` class after the initial load completes:

```javascript
c.classList.remove('animation__fade-in');
```

after the first render.

## Edge cases to handle

| Scenario | Expected behavior |
|---|---|
| User opens page fresh | Existing loader → template fade-in behavior works as today. |
| User leaves tab open overnight | Next scheduled poll or visibility change refreshes to the new days count. |
| User returns after a short tab switch (< 5 min) | No extra fetch. |
| User returns after a long tab switch (> 5 min) | Immediate fetch with `cache: 'no-store'`. |
| API is down during a refresh | Existing content remains visible; error logged to console. |
| Template text is unchanged after a fetch | DOM is not rewritten; no visual change. |
| CDN or browser caches the old template | `cache: 'no-store'` on refresh fetches bypasses it. |

## Files to edit

- `/index.html` — only the inline `<script>` block needs changes.

No changes are needed to:

- CSS
- The `/vacations` page
- The `/all` page
- Assets
- Backend/API
- Build process

## Out of scope (not recommended)

- **WebSockets / Server-Sent Events**: unnecessary lift for a once-per-day update.
- **Service Worker background sync**: adds deployment complexity.
- **Client-side date math from JSON**: would require a new API endpoint and would duplicate the existing template rendering logic in the frontend.

## Acceptance criteria

1. After midnight Colombia time, a tab that was left open automatically shows the updated days-left value without a manual refresh.
2. Returning to a stale tab after several minutes triggers a fresh fetch.
3. If the fetched template is identical to the current one, the page does not flicker or replay the entrance animation.
4. A failed background refresh does not clear or break the current page content.
5. The solution uses only HTML, CSS, and vanilla JS — no new dependencies or build steps.
