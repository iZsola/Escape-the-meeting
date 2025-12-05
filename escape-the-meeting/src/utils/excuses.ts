// Categorize excuses to match context

// Gerunds: Things you are doing RIGHT NOW. "I'm currently..."
export const TECH_ACTIVITIES = [
  "compiling the mainframe", 
  "defragging the docker container", 
  "updating the npm universe", 
  "waiting for the linter to calm down",
  "refactoring the legacy spaghetti",
  "training the AI on cat videos",
  "investigating a race condition in the coffee machine",
  "centering a div vertically",
  "decrypting the WiFi password",
  "migrating the database to a spreadsheet",
  "rebasing the git history onto main",
  "debugging a heisenbug in production"
];

export const FINANCE_ACTIVITIES = [
  "auditing my lunch money",
  "depreciating my personal assets",
  "liquidating my time inventory",
  "calculating the ROI of this conversation",
  "forecasting my weekend budget"
];

export const HR_ACTIVITIES = [
  "practicing radical candor elsewhere",
  "validating my own feelings",
  "in a mandatory deep breathing session",
  "aligning my chakras",
  "visualizing my success (in another room)"
];

// Full sentences: "I have to..." or "I need to..."
export const URGENT_EXCUSES = [
  "I have a hard stop right now. It's strictly biological.",
  "I have to go water my plastic plants.",
  "I need to return some videotapes.",
  "I have to go explain to my cat why I'm not rich yet.",
  "I need to re-calibrate my standing desk.",
  "I have to go catch a pigeon.",
  "I need to update my LinkedIn profile... urgently."
];

// Full sentences: Declarations of state.
export const STATE_EXCUSES = [
  "My aura is currently recharging.",
  "Sorry, I'm allergic to unplanned syncs.",
  "My horoscope explicitly warned me about this meeting.",
  "I think I left my stove on... in the metaverse.",
  "I'm observing a moment of silence for my productivity.",
  "My personality type is currently 'Offline'.",
  "The voices in my head said 'no'.",
  "That sounds like a 'future me' problem."
];

// Deflections for specific "Who/What/How" questions where "I am doing X" is a bad answer
export const DEFLECTION_EXCUSES = [
  "I think Chad did it.",
  "That sounds like a question for Stack Overflow.",
  "I would answer, but I'm under a strict NDA with myself.",
  "The AI generated that code, not me.",
  "I believe that was a cosmic ray bit flip.",
  "I'm not authorized to answer that without my lawyer.",
  "Have you tried asking ChatGPT?",
  "I plead the Fifth."
];

export const getContextAwareExcuse = (managerName: string, question: string = "") => {
  const q = question.toLowerCase();
  let category = "generic";
  
  if (managerName.includes("DevOps") || managerName.includes("CTO") || managerName.includes("Tech") || managerName.includes("Visionary")) {
    category = "tech";
  } else if (managerName.includes("HR")) {
    category = "hr";
  } else if (managerName.includes("Acct")) {
    category = "finance";
  }

  // Detect Intent based on Question Keywords
  const isUrgentRequest = q.includes("sec") || q.includes("min") || q.includes("now") || q.includes("asap") || q.includes("huddle") || q.includes("sync");
  const isAccusation = q.includes("late") || q.includes("fail") || q.includes("did you") || q.includes("report") || q.includes("why");
  const isInformation = q.includes("who") || q.includes("what") || q.includes("how") || q.includes("where") || q.includes("track");

  const roll = Math.random();

  // 1. Handle Information Requests ("Who pushed?", "How do I?") -> Deflect or Escape
  if (isInformation) {
      if (roll < 0.6) {
          // Deflection (New category)
          return DEFLECTION_EXCUSES[Math.floor(Math.random() * DEFLECTION_EXCUSES.length)];
      } else {
          // Escape
          return URGENT_EXCUSES[Math.floor(Math.random() * URGENT_EXCUSES.length)];
      }
  }

  // 2. Handle Accusations ("You were late") -> Deflect with Activity ("I was/am...") or State
  if (isAccusation) {
    if (category === "tech" && roll < 0.7) {
      return `I'm currently ${TECH_ACTIVITIES[Math.floor(Math.random() * TECH_ACTIVITIES.length)]}.`;
    } else if (category === "finance" && roll < 0.7) {
      return `I'm currently ${FINANCE_ACTIVITIES[Math.floor(Math.random() * FINANCE_ACTIVITIES.length)]}.`;
    } else if (category === "hr" && roll < 0.7) {
      return `I'm currently ${HR_ACTIVITIES[Math.floor(Math.random() * HR_ACTIVITIES.length)]}.`;
    } else {
       // Fallback to State
       return STATE_EXCUSES[Math.floor(Math.random() * STATE_EXCUSES.length)];
    }
  }

  // 3. Handle Urgent Requests ("Do you have a sec?") -> Refuse with Urgency ("I have to...") or State ("I can't...")
  if (isUrgentRequest) {
     if (roll < 0.5) {
         return URGENT_EXCUSES[Math.floor(Math.random() * URGENT_EXCUSES.length)];
     } else {
         // Mix in "I can't, I'm [Activity]"
         if (category === "tech") {
             return `I can't, I'm ${TECH_ACTIVITIES[Math.floor(Math.random() * TECH_ACTIVITIES.length)]}.`;
         }
         return STATE_EXCUSES[Math.floor(Math.random() * STATE_EXCUSES.length)];
     }
  }

  // 4. Generic / Fallback
  if (roll < 0.4) {
    return URGENT_EXCUSES[Math.floor(Math.random() * URGENT_EXCUSES.length)];
  } else if (roll < 0.7) {
      // Activity based
      let acts = TECH_ACTIVITIES;
      if (category === "finance") acts = FINANCE_ACTIVITIES;
      if (category === "hr") acts = HR_ACTIVITIES;
      return `Sorry, I'm ${acts[Math.floor(Math.random() * acts.length)]}.`;
  } else {
    return STATE_EXCUSES[Math.floor(Math.random() * STATE_EXCUSES.length)];
  }
};

// Keep original for backward compatibility or generic use
export const generateExcuse = () => {
  return getContextAwareExcuse("Generic Manager", "");
};
