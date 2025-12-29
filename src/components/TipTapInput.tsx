import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { BubbleMenu } from '@tiptap/react/menus'
import { TextSelection } from '@tiptap/pm/state'
import { useQuery } from '@tanstack/react-query'

import { SpellError } from '../extensions/SpellError'
import { API_END_POINT, postRequest } from '../utils/api'
import type { ApiResponse, ResponseCheckSpellGrammar, SpellGrammarError, } from '../types/api'
import { useDebounce } from '../hooks/useDebounce'
import SpellSuggestionMenu from './SpellSuggestionMenu'

import './TipTapInput.scss'
import { CustomHighlight } from './CustomHighlight'
import { buildContentFromTemplate, editorToTemplate, parseHtmlMarkToTemplate } from './helpers'
import { Button } from 'antd'






/* =========================
   2. Types
   ========================= */
export interface TipTapInputProps {
    value?: string
    onChange?: (value: string) => void
    options?: string[]
    onOptionsChange?: (options: string[]) => void
    disabled?: boolean
    maxBlankLength?: number
    maxBlankCount?: number
    placeholder?: string
    className?: string
    style?: React.CSSProperties
    size?: 'small' | 'middle' | 'large'
    autoFocus?: boolean
    hasBlank?: boolean
}

/* =========================
   3. Component
   ========================= */
const TipTapInput: React.FC<TipTapInputProps> = ({
    value = '',
    onChange,
    options = [],
    onOptionsChange,
    disabled = false,
    maxBlankLength = 50,
    maxBlankCount = 10,
    placeholder,
    className,
    style,
    size = 'middle',
    autoFocus = false,
    hasBlank = false
}) => {
    const isUpdatingRef = useRef(false)
    const previousOptionsRef = useRef<string[]>(options)
    const isInitializedRef = useRef(false)
    const isApplyingSpellMarksRef = useRef(false)
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    // Spell check state
    const [selectedError, setSelectedError] = useState<{
        error: SpellGrammarError
        position: { x: number; y: number }
    } | null>(null)
    const editorValueRef = useRef<string>('')
    const [editorText, setEditorText] = useState('')

    const spellErrorsRef = useRef<Map<string, SpellGrammarError>>(new Map())
    const lastSpellTextRef = useRef<string>('')


    /* =========================
       4. Highlight ranges
       ========================= */


    /* =========================
       6. Editor
       ========================= */
    const editor = useEditor({
        editable: !disabled,
        extensions: [
            StarterKit,
            CustomHighlight.configure({ multicolor: true }),
            SpellError.configure({
                HTMLAttributes: {
                    class: 'spell-error',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || '',
            }),
        ],
        autofocus: autoFocus,
        editorProps: {
            handleKeyDown(view, event) {
                if (event.key !== 'Enter') return false

                const { state, dispatch } = view
                const { $from } = state.selection
                const highlight = state.schema.marks.highlight

                // Không có selection hoặc selection không rỗng → chặn
                if (!$from || !state.selection.empty) {
                    event.preventDefault()
                    return true
                }

                // Cursor KHÔNG nằm trong highlight → chặn Enter
                const hasHighlight = $from.marks().some(m => m.type === highlight)
                if (!hasHighlight) {
                    event.preventDefault()
                    return true
                }

                /**
                 * Kiểm tra có đang ở CUỐI highlight không
                 * Cách đúng:
                 * - tại cursor hiện tại: có highlight
                 * - tại cursor + 1: KHÔNG còn highlight
                 */
                const pos = $from.pos
                const isEndOfHighlight =
                    !state.doc.rangeHasMark(pos, pos + 1, highlight)

                if (!isEndOfHighlight) {
                    event.preventDefault()
                    return true
                }

                // === ĐÚNG CUỐI HIGHLIGHT → thoát mark + insert space ===
                event.preventDefault()

                const tr = state.tr
                    .removeStoredMark(highlight)
                    .insertText(' ', pos)

                dispatch(tr)
                return true
            },
            handleDOMEvents: {
                dblclick(view, event) {
                    const coords = { left: event.clientX, top: event.clientY }
                    const posInfo = view.posAtCoords(coords)
                    if (!posInfo) return false

                    const { state, dispatch } = view
                    const $pos = state.doc.resolve(posInfo.pos)

                    // Chỉ xử lý khi double click trong TEXT
                    if (!$pos.parent.isTextblock) return false

                    const node = $pos.parent
                    const text = node.textContent
                    if (!text) return false

                    // offset trong text node
                    const offset = $pos.parentOffset

                    // === TÌM WORD BOUNDARY THỦ CÔNG ===
                    const isWordChar = (ch: string) =>
                        /[A-Za-z0-9À-ỹ]/.test(ch) // unicode VN

                    let start = offset
                    let end = offset

                    while (start > 0 && isWordChar(text[start - 1])) start--
                    while (end < text.length && isWordChar(text[end])) end++

                    // Nếu không phải word thì bỏ
                    if (start === end) return true

                    const from = $pos.start() + start
                    const to = $pos.start() + end

                    dispatch(
                        state.tr.setSelection(
                            TextSelection.create(state.doc, from, to)
                        )
                    )

                    return true // chặn browser default
                },
            },
            handlePaste(view, event) {
                event.preventDefault();

                const clipboardText = event.clipboardData?.getData('text/plain') || '';
                const cleanedText = clipboardText.replace(/[\r\n]+/g, ' ').trim();

                view.dispatch(view.state.tr.insertText(cleanedText, view.state.selection.from, view.state.selection.to));

                return true; // đã xử lý
            },
        },
        onUpdate: ({ editor }) => {
            if (isUpdatingRef.current) return

            // Bỏ qua khi đang apply spell marks (không phải user change)
            if (isApplyingSpellMarksRef.current) return

            // Bỏ qua lần update đầu tiên khi editor được khởi tạo
            if (!isInitializedRef.current) {
                isInitializedRef.current = true
                return
            }

            // Tự động xóa mark chỉ chứa khoảng trắng
            const { tr, doc } = editor.state
            let modified = false

            // Duyệt ngược để tránh vấn đề với vị trí thay đổi
            const marksToRemove: Array<{ from: number; to: number }> = []

            doc.descendants((node, pos) => {
                if (!node.isText || !node.text) return

                const highlightMark = node.marks.find(
                    (m: any) => m.type.name === 'highlight'
                )

                // Kiểm tra nếu mark chỉ chứa khoảng trắng (bao gồm cả tab, newline, space)
                if (highlightMark && (!node.text || node.text.trim() === '')) {
                    const from = pos
                    const to = pos + node.nodeSize - 2
                    marksToRemove.push({ from, to })
                    modified = true
                }
            })

            // Xóa mark từ cuối lên đầu để tránh vấn đề với vị trí
            marksToRemove.reverse().forEach(({ from, to }) => {
                tr.removeMark(from, to, editor.schema.marks.highlight)
            })

            if (modified) {
                // Dispatch và return, onUpdate sẽ được gọi lại sau khi dispatch
                editor.view.dispatch(tr)
                return
            }

            setEditorText(editor.getText())

            if (hasBlank) {
                // Xóa mark chỉ chứa khoảng trắng trước khi parse HTML
                const { tr: cleanTr, doc } = editor.state
                let hasWhitespaceMarks = false
                const marksToRemove: Array<{ from: number; to: number }> = []

                doc.descendants((node, pos) => {
                    if (!node.isText || !node.text) return true
                    const highlightMark = node.marks.find(
                        (m: any) => m.type.name === 'highlight'
                    )
                    if (highlightMark && (!node.text || node.text.trim() === '')) {
                        const fromPos = pos
                        const toPos = pos + node.nodeSize - 2
                        marksToRemove.push({ from: fromPos, to: toPos })
                        hasWhitespaceMarks = true
                    }
                    return true
                })

                // Xóa mark chỉ chứa khoảng trắng từ cuối lên đầu
                if (hasWhitespaceMarks) {
                    marksToRemove.reverse().forEach(({ from, to }) => {
                        cleanTr.removeMark(from, to, editor.schema.marks.highlight)
                    })
                    editor.view.dispatch(cleanTr)
                    // Return để onUpdate được gọi lại sau khi dispatch
                    return
                }

                const html = editor.view.dom.innerHTML
                const { template, options } = parseHtmlMarkToTemplate(html)
                onChange?.(template)
                onOptionsChange?.(options)
                forceUpdate()
                return
            }

            const template = editorToTemplate(editor)
            const text = editor.getText()
            setEditorText(text)
            editorValueRef.current = text
            onChange?.(template)
            forceUpdate()
        },
        onSelectionUpdate: ({ editor }) => {
            const { state, view } = editor
            const { $from } = state.selection
            const highlight = state.schema.marks.highlight

            const mark = $from.marks().find(m => m.type === highlight)

            if (mark) {
                // cursor đang trong highlight → restore storedMarks
                view.dispatch(
                    state.tr.setStoredMarks([mark])
                )
            }

            forceUpdate()
        }

    })

    /* =========================
       Spell Check - API Call
       ========================= */
    const debouncedEditorValue = useDebounce(editorText, 500)

    const { data: spellCheckGrammar } = useQuery<ApiResponse<ResponseCheckSpellGrammar>>({
        queryKey: [API_END_POINT.AI_CHECK_GRAMMAR_SPELL, debouncedEditorValue],
        queryFn: () =>
            postRequest<ApiResponse<ResponseCheckSpellGrammar>>(API_END_POINT.AI_CHECK_GRAMMAR_SPELL, {
                text: debouncedEditorValue,
            }),
        enabled: !!debouncedEditorValue,
    })

    /* =========================
       Apply Spell Error Marks
       ========================= */
    useEffect(() => {
        if (!editor || !spellCheckGrammar) return

        if (lastSpellTextRef.current === debouncedEditorValue) return
        lastSpellTextRef.current = debouncedEditorValue

        // Set flag để ngăn onUpdate trigger onChange
        isApplyingSpellMarksRef.current = true

        const errorItems = spellCheckGrammar.data || []
        const { state } = editor
        const tr = state.tr
        let modified = false

        const spellMark = editor.schema.marks.spellError

        /** STEP 1: remove ALL old spellError marks */
        state.doc.descendants((node, pos) => {
            if (!node.isText) return
            if (node.marks.some(m => m.type === spellMark)) {
                tr.removeMark(pos, pos + node.nodeSize - 2, spellMark)
                modified = true
            }
        })

        if (!errorItems.length) {
            if (modified) editor.view.dispatch(tr)
            spellErrorsRef.current = new Map()
            // Reset flag sau khi dispatch
            setTimeout(() => {
                isApplyingSpellMarksRef.current = false
            }, 0)
            return
        }

        /** STEP 2: build plain-text → doc position map (ONCE) */
        const textNodes: Array<{
            from: number
            to: number
            text: string
            docFrom: number
        }> = []

        let plainOffset = 0
        state.doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return
            const from = plainOffset
            const to = from + node.text.length
            textNodes.push({
                from,
                to,
                text: node.text,
                docFrom: pos,
            })
            plainOffset = to
        })

        const resolvePos = (offset: number) => {
            for (const n of textNodes) {
                if (offset >= n.from && offset <= n.to) {
                    return n.docFrom + (offset - n.from)
                }
            }
            return -1
        }

        /** STEP 3: apply NEW marks (NO dispatch yet) */
        const errorMap = new Map<string, SpellGrammarError>()

        errorItems.forEach(item => {
            const from = resolvePos(item.offset)
            const to = resolvePos(item.offset + item.length)

            if (from < 0 || to < 0 || from >= to) return

            const textBetween = state.doc.textBetween(from, to, '\n', '\n')

            // Nếu API trả text_error → check strict
            if (item.text_error) {
                if (textBetween !== item.text_error) return
            }
            // Nếu API KHÔNG trả text_error → fallback bằng length
            else {
                if (textBetween.length !== item.length) return
            }

            const errorId = `${from}-${to}`

            errorMap.set(errorId, {
                word: item.text_error,
                start: from,
                end: to,
                suggestions: item.replacements,
            })

            tr.addMark(
                from,
                to,
                spellMark.create({ errorId })
            )

            modified = true
        })


        if (modified) {
            editor.view.dispatch(tr)
            spellErrorsRef.current = errorMap
            lastSpellTextRef.current = debouncedEditorValue
        }

        // Reset flag sau khi dispatch
        setTimeout(() => {
            isApplyingSpellMarksRef.current = false
        }, 0)
    }, [editor, spellCheckGrammar])


    /* =========================
       Handle Spell Error Click
       ========================= */
    useEffect(() => {
        if (!editor) return

        const view = editor.view
        const handler = (event: MouseEvent) => {
            const posInfo = view.posAtCoords({ left: event.clientX, top: event.clientY })
            if (!posInfo) return

            const { state } = view
            const $pos = state.doc.resolve(posInfo.pos)
            const mark = $pos.marks().find(m => m.type.name === 'spellError')

            if (!mark) {
                setSelectedError(null)
                return
            }

            const error = spellErrorsRef.current.get(mark.attrs.errorId)
            if (!error) return

            setSelectedError({
                error,
                position: { x: event.clientX, y: event.clientY + 20 },
            })
        }

        view.dom.addEventListener('click', handler)
        return () => view.dom.removeEventListener('click', handler)
    }, [])

    /* =========================
       Replace Text with Suggestion
       ========================= */
    const handleReplaceText = useCallback(
        (suggestion: string) => {
            if (!editor || !selectedError) return

            const { error } = selectedError
            const { tr } = editor.state

            // Remove spell error mark
            tr.removeMark(error.start, error.end, editor.schema.marks.spellError)

            // Replace text
            tr.replaceWith(error.start, error.end, editor.schema.text(suggestion))

            editor.view.dispatch(tr)
            setSelectedError(null)

            // Update editor value ref
            editorValueRef.current = editor.getText()
        },
        [editor, selectedError]
    )



    /* =========================
       8. Update editable state when disabled changes
       ========================= */
    useEffect(() => {
        if (!editor) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    /* =========================
       9. Update editor content when value or options change
       ========================= */
    useEffect(() => {
        if (!editor) return
        if (isUpdatingRef.current) return

        // Check if options changed
        const optionsChanged =
            options.length !== previousOptionsRef.current.length ||
            options.some((v, i) => v !== previousOptionsRef.current[i])
        // Check if we need to update content
        const currentTemplate = editorToTemplate(editor)
        const templateChanged = currentTemplate !== value

        if (!templateChanged && !optionsChanged) {
            return
        }

        // Value or options changed, rebuild content from template
        isUpdatingRef.current = true
        previousOptionsRef.current = [...options]
        const content = buildContentFromTemplate(editor, value, options)

        // Lưu selection hiện tại trước khi setContent
        const currentSelection = editor.state.selection
        const savedFrom = currentSelection.from
        const savedTo = currentSelection.to

        editor.commands.setContent({
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content,
                },
            ],
        })

        // Restore selection sau khi setContent
        setTimeout(() => {
            const docSize = editor.state.doc.content.size
            const safeFrom = Math.min(savedFrom, docSize)
            const safeTo = Math.min(savedTo, docSize)

            editor.commands.setTextSelection({ from: safeFrom, to: safeTo })
        }, 0)

        setTimeout(() => {
            isUpdatingRef.current = false
            // Update editor text for spell check - use requestAnimationFrame to ensure content is set
            requestAnimationFrame(() => {
                const text = editor.getText()
                setEditorText(text)
            })
            // Đánh dấu editor đã được khởi tạo sau lần setContent đầu tiên
            if (!isInitializedRef.current) {
                isInitializedRef.current = true
            }
        }, 0)
    }, [editor, value])



    /* =========================
       10. Render
       ========================= */
    const wrapperClassName = `ant-input-wrapper ${className || ''} ${size ? `ant-input-${size}` : ''}`.trim()

    return (
        <div className={wrapperClassName} style={style}>
            <EditorContent editor={editor} />

            {editor && <BubbleMenu
                editor={editor}
                options={{ placement: 'bottom', offset: 8, flip: true }}
                shouldShow={({ editor, state }) => {
                    if (!editor) return false

                    const { from, to } = state.selection
                    if (from === to) return false // không có selection

                    const highlightMark = editor.schema.marks.highlight
                    const hasHighlight = state.doc.rangeHasMark(from, to, highlightMark)

                    // Nếu selection đang có highlight → là Un Blank → luôn hiển thị
                    if (hasHighlight) return true

                    // Kiểm tra spell error → vẫn ẩn nếu selection có lỗi
                    const hasSpellError = state.doc.rangeHasMark(from, to, editor.schema.marks.spellError)
                    if (hasSpellError) return false

                    // Chỉ kiểm tra giới hạn nếu là Add Blank
                    const selectedText = state.doc.textBetween(from, to, '\n', '\n')
                    if (selectedText.length > (maxBlankLength ?? Infinity)) return false

                    // Đếm tổng số highlight hiện tại
                    let highlightCount = 0
                    state.doc.descendants((node) => {
                        if (!node.isText) return
                        if (node.marks.some(m => m.type.name === 'highlight')) highlightCount++
                    })
                    if (highlightCount >= (maxBlankCount ?? Infinity)) return false

                    return true
                }}

            >
                {(() => {
                    // Kiểm tra trực tiếp từ editor state xem selection có highlight không
                    const { from, to } = editor.state.selection
                    const hasHighlight = editor.state.doc.rangeHasMark(from, to, editor.schema.marks.highlight)

                    return (
                        <Button
                            onClick={() => {
                                if (!editor) return

                                const { state, view } = editor
                                const spellMark = state.schema.marks.spellError

                                // Lưu selection hiện tại
                                const { from: selFrom, to: selTo } = state.selection
                                const currentSpellErrors = new Map(spellErrorsRef.current)

                                // Tạo transaction mới
                                const tr = state.tr

                                // Toggle highlight cho selection
                                const highlightMark = state.schema.marks.highlight
                                const hasHighlight = state.doc.rangeHasMark(selFrom, selTo, highlightMark)

                                if (hasHighlight) {
                                    tr.removeMark(selFrom, selTo, highlightMark)
                                } else {
                                    tr.addMark(selFrom, selTo, highlightMark.create())
                                }

                                // Re-apply spell errors mà vẫn giữ selection
                                currentSpellErrors.forEach((error) => {
                                    const { start, end, word } = error
                                    if (start >= 0 && end <= tr.doc.content.size && start < end) {
                                        const textBetween = tr.doc.textBetween(start, end, '\n', '\n')
                                        if (textBetween === word) {
                                            const errorId = `${start}-${end}`
                                            tr.addMark(start, end, spellMark.create({ errorId }))
                                        }
                                    }
                                })

                                // Restore selection cũ
                                tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))

                                // Dispatch transaction
                                view.dispatch(tr)

                                // Force update BubbleMenu
                                forceUpdate()
                            }}
                            className={hasHighlight ? 'is-active' : ''}
                            size={size}>
                            {hasHighlight ? 'Un Blank' : 'Add Blank'}
                        </Button>
                    )
                })()}
            </BubbleMenu>}

            {selectedError && (
                <SpellSuggestionMenu
                    suggestions={selectedError.error.suggestions}
                    position={selectedError.position}
                    onSelect={handleReplaceText}
                    onClose={() => setSelectedError(null)}
                />
            )}
        </div>
    )
}

export default TipTapInput
