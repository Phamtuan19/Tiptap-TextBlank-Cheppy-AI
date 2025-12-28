import { Mark, mergeAttributes } from "@tiptap/core";

export interface SpellErrorOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spellError: {
      /**
       * Set a spell error mark
       */
      setSpellError: (attributes?: { errorId?: string }) => ReturnType;
      /**
       * Toggle a spell error mark
       */
      toggleSpellError: (attributes?: { errorId?: string }) => ReturnType;
      /**
       * Unset a spell error mark
       */
      unsetSpellError: () => ReturnType;
    };
  }
}

export const SpellError = Mark.create<SpellErrorOptions>({
  name: "spellError",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-spell-error]",
        getAttrs: (node) => {
          if (typeof node === "string") return false;
          return {
            errorId: (node as HTMLElement).getAttribute("data-error-id"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-spell-error": "true",
        "data-error-id": HTMLAttributes.errorId || "",
      }),
      0,
    ];
  },

  addAttributes() {
    return {
      errorId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-error-id"),
        renderHTML: (attributes) => {
          if (!attributes.errorId) {
            return {};
          }
          return {
            "data-error-id": attributes.errorId,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      setSpellError:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      toggleSpellError:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetSpellError:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
