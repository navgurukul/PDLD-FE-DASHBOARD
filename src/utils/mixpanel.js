import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

let initialized = false;
if (MIXPANEL_TOKEN) {
  try {
    mixpanel.init(MIXPANEL_TOKEN, { debug: true });
    initialized = true;
  } catch (error) {
    console.error('Mixpanel init failed:', error);
  }
}

// Analytics is best-effort: with no token, a failed init, or a blocked request, calls do nothing
// instead of crashing the page
const safe = (call, fallback) => (...args) => {
  if (!initialized) return fallback;
  try {
    return call(...args);
  } catch (error) {
    console.error('Mixpanel call failed:', error);
    return fallback;
  }
};

export default {
  track: safe((...args) => mixpanel.track(...args)),
  identify: safe((...args) => mixpanel.identify(...args)),
  alias: safe((...args) => mixpanel.alias(...args)),
  reset: safe(() => mixpanel.reset()),
  get_distinct_id: safe(() => mixpanel.get_distinct_id(), null),
  people: {
    set: safe((...args) => mixpanel.people.set(...args)),
  },
};
