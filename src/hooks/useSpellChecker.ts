import { useState, useEffect } from "react";

// Mock types - replace with actual types from your spell checker library
type NSpellExtended = {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
};

// Mock function - replace with your actual implementation
async function getSpellInstance(): Promise<{
  gb: NSpellExtended;
  us: NSpellExtended;
} | null> {
  // Mock implementation - replace with your actual spell checker initialization
  return {
    gb: {
      correct: (word: string) => {
        // Mock: accept common words
        const commonWords = ["hello", "world", "test", "the", "is", "a", "an"];
        return commonWords.includes(word.toLowerCase());
      },
      suggest: (_word: string) => {
        // Mock suggestions
        return ["hello", "world", "test"];
      },
    },
    us: {
      correct: (word: string) => {
        const commonWords = ["hello", "world", "test", "the", "is", "a", "an"];
        return commonWords.includes(word.toLowerCase());
      },
      suggest: (word: string) => {
        return ["hello", "world", "test"];
      },
    },
  };
}

function normalizeApostrophes(text: string): string {
  // Normalize apostrophes - replace with your actual implementation
  return text.replace(/[''`]/g, "'");
}

const CONTRACTIONS: string[] = [
  "don't",
  "won't",
  "can't",
  "couldn't",
  "shouldn't",
  "wouldn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "hasn't",
  "haven't",
  "hadn't",
  "doesn't",
  "didn't",
  "i'm",
  "you're",
  "he's",
  "she's",
  "it's",
  "we're",
  "they're",
  "i've",
  "you've",
  "we've",
  "they've",
  "i'd",
  "you'd",
  "he'd",
  "she'd",
  "we'd",
  "they'd",
  "i'll",
  "you'll",
  "he'll",
  "she'll",
  "we'll",
  "they'll",
];

export function useSpellChecker() {
  const [spell, setSpell] = useState<{
    gb: NSpellExtended;
    us: NSpellExtended;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSpellInstance()
      .then((instance) => {
        if (mounted && instance) {
          setSpell(instance);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const check = (word: string) => {
    if (!spell) return false;

    let cleanWord = normalizeApostrophes(word)
      .replace(/^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu, "")
      .replace(/^['-]+|['-]+$/g, "");

    if (!cleanWord) return false;

    cleanWord = cleanWord.toLowerCase();

    // ✅ Bỏ qua từ rút gọn hợp lệ
    if (CONTRACTIONS.includes(cleanWord)) return false;

    // Nếu chứa ký tự lạ => sai
    if (!/^[\p{L}\p{N}'-]+$/u.test(cleanWord)) return true;

    const { gb, us } = spell;

    const isCorrectGB = gb.correct(cleanWord);
    const isCorrectUS = us.correct(cleanWord);

    return !isCorrectGB && !isCorrectUS;
  };

  const suggest = (word: string) => {
    if (!spell) return [];
    const gbSuggestions = spell.gb.suggest(word);
    const usSuggestions = spell.us.suggest(word);
    return Array.from(new Set([...gbSuggestions, ...usSuggestions]));
  };

  const tokenize = (text: string) => {
    const tokens: { word: string; start: number; end: number }[] = [];
    let current = "";
    let start = 0;

    for (let i = 0; i < text.length; i++) {
      const char = normalizeApostrophes(text[i]);
      if (/[\p{L}'-]/u.test(char)) {
        if (current === "") start = i;
        current += char;
      } else if (/[0-9]/.test(char) && current) {
        current += char;
      } else {
        if (current) {
          tokens.push({ word: current, start, end: i });
          current = "";
        }
      }
    }

    if (current) tokens.push({ word: current, start, end: text.length });

    return tokens;
  };

  const checkText = (text: string) => {
    if (!spell) return [];
    const tokens = tokenize(text);
    return tokens.filter((t) => check(t.word));
  };

  return { check, suggest, checkText, isLoading };
}
