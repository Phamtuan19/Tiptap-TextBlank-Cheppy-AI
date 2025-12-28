import Highlight from "@tiptap/extension-highlight";
import { Plugin, TextSelection } from "@tiptap/pm/state";

/* =========================
   1. Custom Highlight
   ========================= */
export const CustomHighlight = Highlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      // 🔥 BẮT BUỘC – chống merge
      uniqueId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-unique-id"),
        renderHTML: (attrs) =>
          attrs.uniqueId ? { "data-unique-id": attrs.uniqueId } : {},
      },
    };
  },

  // Ngăn chặn merge các mark với nhau
  // TipTap sẽ không merge các mark nếu chúng có uniqueId khác nhau
  // Vì mỗi mark đã có uniqueId riêng, nên chúng sẽ không merge
  // excludes: '',

  addCommands() {
    return {
      ...this.parent?.(),

      toggleHighlight: (attributes) => {
        return ({ state, tr, dispatch, commands }) => {
          const { from, to, empty } = state.selection;

          if (empty) {
            // Nếu không có selection, dùng command mặc định với uniqueId mới
            return commands.toggleMark(this.name, {
              ...attributes,
              uniqueId: crypto.randomUUID(),
            });
          }

          // Lấy text trong selection
          const selectedText = state.doc.textBetween(from, to);

          // Nếu selection chỉ chứa khoảng trắng, xóa mark và giữ lại khoảng trắng
          if (selectedText.trim() === "") {
            // Xóa tất cả mark trong selection
            tr.removeMark(from, to, this.type);

            if (dispatch) {
              dispatch(tr);
            }
            return true;
          }

          // Kiểm tra xem toàn bộ selection có mark highlight không
          let allTextHasHighlight = true;
          let hasAnyHighlight = false;
          let firstDataIndex: string | null = null;
          const dataIndexes = new Set<string>();

          // Kiểm tra tất cả text node trong selection
          state.doc.nodesBetween(from, to, (node) => {
            if (node.isText) {
              const highlightMark = node.marks.find(
                (m: any) => m.type.name === "highlight"
              );

              if (highlightMark) {
                hasAnyHighlight = true;
                if (highlightMark.attrs?.dataIndex != null) {
                  dataIndexes.add(highlightMark.attrs.dataIndex);
                  if (!firstDataIndex) {
                    firstDataIndex = highlightMark.attrs.dataIndex;
                  }
                }
              } else {
                // Nếu có text node không có mark, thì không phải toàn bộ selection có mark
                allTextHasHighlight = false;
              }
            }
          });

          // Nếu toàn bộ selection đã có mark, thì xóa mark (toggle off)
          if (allTextHasHighlight && hasAnyHighlight) {
            // Xóa tất cả mark trong selection
            tr.removeMark(from, to, this.type);

            // Sau khi xóa mark, kiểm tra và xóa mark chỉ chứa khoảng trắng trong toàn bộ document
            const marksToRemove: Array<{ from: number; to: number }> = [];
            tr.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;

              const highlightMark = node.marks.find(
                (m: any) => m.type.name === "highlight"
              );

              if (highlightMark && (!node.text || node.text.trim() === "")) {
                const fromPos = pos;
                const toPos = pos + node.nodeSize - 2;
                marksToRemove.push({ from: fromPos, to: toPos });
              }
            });

            // Xóa mark chỉ chứa khoảng trắng từ cuối lên đầu
            marksToRemove.reverse().forEach(({ from: fromPos, to: toPos }) => {
              tr.removeMark(fromPos, toPos, this.type);
            });

            // Giữ nguyên selection sau khi toggle
            tr.setSelection(TextSelection.create(tr.doc, from, to));

            if (dispatch) {
              dispatch(tr);
            }
            return true;
          }

          // Nếu selection chưa có mark hoặc chỉ có một phần có mark, thì thêm mark (toggle on)
          // Xóa tất cả mark cũ trong selection trước
          tr.removeMark(from, to, this.type);

          // Thêm mark mới với uniqueId mới cho toàn bộ selection
          const newAttrs = {
            ...attributes,
            uniqueId: crypto.randomUUID(),
            // Giữ dataIndex nếu tất cả mark trong selection có cùng dataIndex
            ...(firstDataIndex && dataIndexes.size === 1
              ? { dataIndex: firstDataIndex }
              : {}),
          };
          tr.addMark(from, to, this.type.create(newAttrs));

          // Sau khi thêm mark, kiểm tra và xóa mark chỉ chứa khoảng trắng trong toàn bộ document
          const marksToRemove: Array<{ from: number; to: number }> = [];
          tr.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return;

            const highlightMark = node.marks.find(
              (m: any) => m.type.name === "highlight"
            );

            if (highlightMark && (!node.text || node.text.trim() === "")) {
              const fromPos = pos;
              const toPos = pos + node.nodeSize - 2;
              marksToRemove.push({ from: fromPos, to: toPos });
            }
          });

          // Xóa mark chỉ chứa khoảng trắng từ cuối lên đầu
          marksToRemove.reverse().forEach(({ from: fromPos, to: toPos }) => {
            tr.removeMark(fromPos, toPos, this.type);
          });

          // Giữ nguyên selection sau khi toggle
          tr.setSelection(TextSelection.create(tr.doc, from, to));

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        };
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, _oldState, newState) => {
          // Chỉ xử lý nếu có transaction thay đổi
          if (!transactions.some((tr) => tr.docChanged)) {
            return null;
          }

          const { tr, doc } = newState;
          let modified = false;
          const marksToRemove: Array<{ from: number; to: number }> = [];

          doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return;

            const highlightMark = node.marks.find(
              (m: any) => m.type.name === "highlight"
            );

            // Xóa mark nếu chỉ chứa khoảng trắng
            if (highlightMark && (!node.text || node.text.trim() === "")) {
              const from = pos;
              const to = pos + node.nodeSize - 2;
              marksToRemove.push({ from, to });
              modified = true;
            }
          });

          if (modified) {
            // Xóa mark từ cuối lên đầu để tránh vấn đề với vị trí
            marksToRemove.reverse().forEach(({ from, to }) => {
              tr.removeMark(from, to, this.type);
            });
            return tr;
          }

          return null;
        },
      }),
    ];
  },
});
