const MAX_DISPLAY_NAME_LENGTH = 20;

const BANNED_WORDS = [
  "admin",
  "administrator",
  "moderator",
  "official",
  "運営",
  "管理者",
  "公式",
  "スタッフ",
  "バカ",
  "アホ",
  "クソ",
  "くそ",
  "きもい",
  "死ね",
  "殺す",
  "うざい",
  "馬鹿",
  "阿呆",
  "fuck",
  "shit",
  "damn",
  "bitch",
  "asshole",
  "nazi",
];

export function validateDisplayName(name: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  const normalized = name.trim();

  if (normalized.length < 1) {
    return { valid: false, error: "名前を入力してください" };
  }

  if (normalized.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      valid: false,
      error: `名前は${MAX_DISPLAY_NAME_LENGTH}文字以内で入力してください`,
    };
  }

  const lower = normalized.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { valid: false, error: "使用できない名前です" };
    }
  }

  return { valid: true, normalized };
}
