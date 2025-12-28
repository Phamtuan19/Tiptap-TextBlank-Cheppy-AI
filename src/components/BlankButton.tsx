import type { Editor } from "@tiptap/react"
import { Button } from "antd"

const BlankButton = ({ editor, size, onClick }: { editor: Editor, size: 'small' | 'middle' | 'large', onClick: () => void }) => {
    const { from, to } = editor.state.selection
    const hasHighlight = editor.state.doc.rangeHasMark(
        from, to, editor.schema.marks.highlight
    )

    return (
        <Button
            size={size}
            className={hasHighlight ? 'is-active' : ''}
            onClick={onClick}
        >
            {hasHighlight ? 'Un Blank' : 'Add Blank'}
        </Button>
    )
}

export default BlankButton