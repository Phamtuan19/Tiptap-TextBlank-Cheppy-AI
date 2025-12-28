import React, { useEffect, useRef } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import './SpellSuggestionMenu.scss'

interface SpellSuggestionMenuProps {
    suggestions: string[]
    position: { x: number; y: number }
    onSelect: (suggestion: string) => void
    onClose: () => void
}

const SpellSuggestionMenu: React.FC<SpellSuggestionMenuProps> = ({
    suggestions,
    position,
    onSelect,
    onClose,
}) => {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    const menuItems: MenuProps['items'] = suggestions.map((suggestion, index) => ({
        key: index.toString(),
        label: <div className="flex items-center justify-between text-sm">
            <span>{suggestion}</span>
            <span className="text-gray-500 text-xs">(Cheppy AI)</span>
        </div>,
        onClick: () => {
            onSelect(suggestion)
            onClose()
        },
    }))

    if (suggestions.length === 0) {
        return null
    }

    return (
        <div
            ref={menuRef}
            className="spell-suggestion-menu"
            style={{
                left: position.x,
                top: position.y - 10,
            }}
        >
            <Menu
                items={menuItems}
                selectable={false}
                className="spell-suggestion-menu-items text-sm !border-none"

            />
        </div>
    )
}

export default SpellSuggestionMenu

