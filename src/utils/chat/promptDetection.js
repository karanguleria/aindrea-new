/**
 * Prompt detection utilities for analyzing user prompts and detecting image generation intent
 */

/**
 * Calculate Levenshtein distance for fuzzy matching
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Levenshtein distance
 */
export const levenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Fuzzy match for spelling mistakes
 * @param {string} text - Text to search in
 * @param {Array<string>} keywords - Keywords to search for
 * @param {number} threshold - Maximum Levenshtein distance (default: 2)
 * @returns {boolean} True if any keyword matches
 */
export const fuzzyMatch = (text, keywords, threshold = 2) => {
  const words = text.toLowerCase().split(/\s+/);
  for (const keyword of keywords) {
    for (const word of words) {
      if (levenshteinDistance(word, keyword) <= threshold) {
        return true;
      }
    }
    // Also check if keyword appears with typos
    if (text.toLowerCase().includes(keyword)) {
      return true;
    }
  }
  return false;
};

/**
 * Auto-detect if the prompt is for EXPLICIT image generation (only for dashboard)
 * NOTE: This is now VERY conservative to allow AI to ask questions first
 * @param {string} prompt - User prompt text
 * @param {string} variant - Component variant (e.g., "dashboard", "chat")
 * @returns {boolean} True if prompt indicates image generation intent
 */
export const detectImageGeneration = (prompt, variant = "dashboard") => {
  if (variant !== "dashboard") return false;

  const promptLower = prompt.toLowerCase();

  // ONLY trigger on EXPLICIT generation commands with confirmation words
  const explicitGenerationCommands = [
    "generate image now",
    "create image now",
    "generate the image",
    "create the image",
    "generate it now",
    "create it now",
    "make it now",
    "proceed with generation",
    "proceed with image",
    "go ahead and generate",
    "go ahead and create",
    "generate this image",
    "create this image",
    "ready to generate",
    "ready to create",
    "start generating",
    "start creating",
    "please generate",
    "please create",
    "yes generate",
    "yes create",
    "generate now",
    "create now",
    "generation now",
    "yes generation",
    "ok generate",
    "ok create",
    "sure generate",
    "sure create",
    "let's generate",
    "let's create",
    // Variations with specific content types
    "generate ad",
    "create ad",
    "generate logo",
    "create logo",
    "generate poster",
    "create poster",
    "generate banner",
    "create banner",
    "generate design",
    "create design",
    // Natural language confirmations for variants/options
    "provide me with options",
    "show me options",
    "give me options",
    "some options",
    "few options",
    "different options",
    "various options",
    "provide me with variants",
    "show me variants",
    "give me variants",
    "variants",
    "some variants",
    "few variants",
    "different variants",
    "provide variants",
    "show variants",
    "more variants",
    "additional variants",
    "extra variants",
    "more options",
    "additional options",
    "extra options",
    "1 more",
    "2 more",
    "3 more",
    "4 more",
    "one more",
    "two more",
    "three more",
    "four more",
  ];

  // Check for explicit generation commands FIRST (takes priority)
  const hasExplicitCommand = explicitGenerationCommands.some((cmd) =>
    promptLower.includes(cmd)
  );

  // If there's an explicit generation command, ALWAYS generate (priority)
  if (hasExplicitCommand) {
    return true;
  }

  // Fuzzy matching for common spelling mistakes
  const generationKeywords = [
    "generate",
    "create",
    "make",
    "build",
    "design",
  ];
  const confirmationKeywords = [
    "now",
    "please",
    "variants",
    "options",
    "images",
  ];

  const hasGenerationKeyword = fuzzyMatch(promptLower, generationKeywords, 2);
  const hasConfirmationKeyword = fuzzyMatch(
    promptLower,
    confirmationKeywords,
    2
  );

  // If both generation and confirmation words found (with typos), likely a generation command
  if (hasGenerationKeyword && hasConfirmationKeyword) {
    return true;
  }

  // Check if this is a variant/option request (takes priority over help detection)
  const isVariantRequest =
    promptLower.includes("more option") ||
    promptLower.includes("more variant") ||
    promptLower.includes("more image") ||
    promptLower.includes("more design") ||
    promptLower.includes("additional option") ||
    promptLower.includes("additional variant") ||
    promptLower.includes("extra option") ||
    promptLower.includes("extra variant");

  // If it's a variant request, always generate
  if (isVariantRequest) {
    return true;
  }

  // Only block if it's a help request WITHOUT generation command
  const isRequestingHelp =
    promptLower.startsWith("i need") ||
    promptLower.startsWith("i want") ||
    promptLower.startsWith("i have") ||
    promptLower.startsWith("can you help") ||
    promptLower.startsWith("help me") ||
    promptLower.includes("need help");

  // If user is requesting help (and no explicit command), let AI converse first
  if (isRequestingHelp) {
    return false;
  }

  // Default: don't auto-generate
  return false;
};

/**
 * Detect variant count from prompt text
 * @param {string} text - Prompt text
 * @returns {number} Number of variants requested (default: 1)
 */
export const detectVariantCount = (text) => {
  const lowerText = text.toLowerCase();

  const moreMatch = lowerText.match(
    /\b(1|one|2|two|3|three|4|four)\s*more\s*(variants?|options?|images?|choices?|designs?)?/
  );
  if (moreMatch) {
    const num = moreMatch[1];
    if (num === "1" || num === "one") return 1;
    if (num === "2" || num === "two") return 2;
    if (num === "3" || num === "three") return 3;
    if (num === "4" || num === "four") return 4;
  }

  if (
    lowerText.match(/\b(2|two)\s*(variants?|options?|images?|choices?)\b/)
  )
    return 2;
  if (
    lowerText.match(/\b(3|three)\s*(variants?|options?|images?|choices?)\b/)
  )
    return 3;
  if (
    lowerText.match(/\b(4|four)\s*(variants?|options?|images?|choices?)\b/)
  )
    return 4;

  if (
    lowerText.includes("multiple") ||
    lowerText.includes("several") ||
    lowerText.includes("some options") ||
    lowerText.includes("few options") ||
    lowerText.includes("more options") ||
    lowerText.includes("additional options") ||
    lowerText.includes("extra options") ||
    lowerText.includes("provide me with options") ||
    lowerText.includes("show me options") ||
    lowerText.includes("give me options") ||
    lowerText.includes("different options") ||
    lowerText.includes("various options") ||
    lowerText.includes("provide options") ||
    lowerText.includes("some variants") ||
    lowerText.includes("few variants") ||
    lowerText.includes("more variants") ||
    lowerText.includes("additional variants") ||
    lowerText.includes("extra variants") ||
    lowerText.includes("provide me with variants") ||
    lowerText.includes("show me variants") ||
    lowerText.includes("give me variants") ||
    lowerText.includes("different variants") ||
    lowerText.includes("provide variants") ||
    lowerText.includes("show variants")
  ) {
    return 3;
  }

  return 1;
};

