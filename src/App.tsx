import React, { useState } from 'react'
import { Card, Space, Typography, Input, Button, Divider } from 'antd'
import TipTapInput from './components/TipTapInput'

const { Title, Text } = Typography

const App: React.FC = () => {
    const [template, setTemplate] = useState('hello wrld, this is a tst of {1} cheker')
    const [tempTemplate, setTempTemplate] = useState('hello wrld, this is a tst of spell cheker')
    const [options, setOptions] = useState<string[]>(['wrld', 'spell'])
    const [disabled, setDisabled] = useState(false)

    const handleApply = () => {
        setTemplate(tempTemplate)
    }

    const handleReset = () => {
        setTempTemplate('')
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <Space direction="vertical" size="large" className="w-full">

                        <div>
                            <Title level={4}>Options:</Title>
                            <div className="mb-2">
                                {options.map((opt, index) => (
                                    <Text key={index} className="mr-2">
                                        <Text strong>{index}:</Text> {opt}
                                    </Text>
                                ))}
                            </div>

                        </div>

                        <Divider />

                        <div>
                            <Title level={4}>Template Value:</Title>
                            <Space.Compact className="w-full">
                                <Input
                                    value={tempTemplate}
                                    onChange={(e) => setTempTemplate(e.target.value)}
                                    placeholder="Nhập template, ví dụ: Tôi tên là {0}. Tôi đến từ {1}"
                                    onPressEnter={handleApply}
                                />
                                <Button type="primary" onClick={handleApply}>
                                    Apply
                                </Button>
                                <Button onClick={handleReset}>
                                    Reset
                                </Button>
                            </Space.Compact>
                        </div>

                        <Divider />

                        <div>
                            <Title level={4}>TipTap Input:</Title>
                            <div className="mb-2">
                                <Button onClick={() => setDisabled(!disabled)} className="mb-2">
                                    {disabled ? 'Enable' : 'Disable'}
                                </Button>
                            </div>
                            <TipTapInput
                                value={template}
                                onChange={(value) => {
                                    console.log('Template changed:', value)
                                    setTemplate(value)
                                }}
                                options={options}
                                onOptionsChange={(newOptions) => {
                                    console.log('Options changed:', newOptions)
                                    setOptions(newOptions)
                                }}
                                size="middle"
                                maxBlankLength={10}
                                maxBlankCount={2}
                                disabled={disabled}
                                hasBlank
                            />
                        </div>



                        <Divider />
                    </Space>
                </Card>
            </div>
        </div>
    )
}

export default App
