import React, { useState } from 'react'
import {
    Card,
    Space,
    Typography,
    Input,
    Button,
    Divider,
    InputNumber,
    Select,
    Switch,
    Form,
    Row,
    Col,
    Tag
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import TipTapInput from './components/TipTapInput'

const { Title, Text } = Typography
const { Option } = Select

const App: React.FC = () => {
    // TipTapInput props state
    const [template, setTemplate] = useState('hello wrld, this is a tst of {1} cheker')
    const [options, setOptions] = useState<string[]>(['wrld', 'spell'])
    const [disabled, setDisabled] = useState(false)
    const [maxBlankLength, setMaxBlankLength] = useState<number>(10)
    const [maxBlankCount, setMaxBlankCount] = useState<number>(2)
    const [placeholder, setPlaceholder] = useState<string>('')
    const [size, setSize] = useState<'small' | 'middle' | 'large'>('middle')
    const [autoFocus, setAutoFocus] = useState(false)
    const [hasBlank, setHasBlank] = useState(true)
    const [className, setClassName] = useState<string>('')

    // Options management
    const [newOption, setNewOption] = useState('')

    const handleAddOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()])
            setNewOption('')
        }
    }

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index))
    }

    const handleUpdateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Card>
                    <Space direction="vertical" size="large" className="w-full">
                        <Title level={2}>TipTap Input Demo - Dynamic Configuration</Title>

                        <Divider />

                        {/* Configuration Panel */}
                        <Card title="Configuration" size="small">
                            <Form layout="vertical">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Template Value">
                                            <Input
                                                value={template}
                                                onChange={(e) => setTemplate(e.target.value)}
                                                placeholder="Nhập template, ví dụ: Tôi tên là {0}. Tôi đến từ {1}"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Placeholder">
                                            <Input
                                                value={placeholder}
                                                onChange={(e) => setPlaceholder(e.target.value)}
                                                placeholder="Placeholder text for editor"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item label="Size">
                                            <Select
                                                value={size}
                                                onChange={(value) => setSize(value)}
                                                style={{ width: '100%' }}
                                            >
                                                <Option value="small">Small</Option>
                                                <Option value="middle">Middle</Option>
                                                <Option value="large">Large</Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="Max Blank Length">
                                            <InputNumber
                                                value={maxBlankLength}
                                                onChange={(value) => setMaxBlankLength(value || 10)}
                                                min={1}
                                                max={100}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="Max Blank Count">
                                            <InputNumber
                                                value={maxBlankCount}
                                                onChange={(value) => setMaxBlankCount(value || 2)}
                                                min={0}
                                                max={100}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item label="Disabled">
                                            <Switch
                                                checked={disabled}
                                                onChange={setDisabled}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="Auto Focus">
                                            <Switch
                                                checked={autoFocus}
                                                onChange={setAutoFocus}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="Has Blank">
                                            <Switch
                                                checked={hasBlank}
                                                onChange={setHasBlank}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Custom Class Name">
                                    <Input
                                        value={className}
                                        onChange={(e) => setClassName(e.target.value)}
                                        placeholder="Custom CSS class name"
                                    />
                                </Form.Item>
                            </Form>
                        </Card>

                        <Divider />

                        {/* Options Management */}
                        <Card title="Options Management" size="small">
                            <Space direction="vertical" className="w-full" size="middle">
                                <div>
                                    <Text strong>Current Options:</Text>
                                    <div className="mt-2 mb-4">
                                        {options.length === 0 ? (
                                            <Text type="secondary">No options yet</Text>
                                        ) : (
                                            <Space wrap>
                                                {options.map((opt, index) => (
                                                    <Tag
                                                        key={index}
                                                        closable
                                                        onClose={() => handleRemoveOption(index)}
                                                        color="blue"
                                                    >
                                                        <Text strong>{index}:</Text> {opt}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        )}
                                    </div>
                                </div>

                                <Space.Compact className="w-full">
                                    <Input
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="Enter new option value"
                                        onPressEnter={handleAddOption}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddOption}
                                    >
                                        Add Option
                                    </Button>
                                </Space.Compact>

                                <div>
                                    <Text strong className="block mb-2">Edit Options:</Text>
                                    <Space direction="vertical" className="w-full" size="small">
                                        {options.map((opt, index) => (
                                            <Space.Compact key={index} className="w-full">
                                                <Input
                                                    addonBefore={`{${index}}:`}
                                                    value={opt}
                                                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                                                    placeholder={`Option ${index}`}
                                                />
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveOption(index)}
                                                />
                                            </Space.Compact>
                                        ))}
                                    </Space>
                                </div>
                            </Space>
                        </Card>

                        <Divider />

                        {/* TipTap Input Display */}
                        <Card title="TipTap Input Preview" size="small">
                            <Space direction="vertical" className="w-full" size="middle">
                                <div>
                                    <Text strong>Current Template: </Text>
                                    <Text code>{template}</Text>
                                </div>
                                <div>
                                    <Text strong>Current Options: </Text>
                                    <Text code>{JSON.stringify(options)}</Text>
                                </div>
                                <Divider />
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
                                    size={size}
                                    maxBlankLength={maxBlankLength}
                                    maxBlankCount={maxBlankCount}
                                    disabled={disabled}
                                    hasBlank={hasBlank}
                                    placeholder={placeholder || undefined}
                                    autoFocus={autoFocus}
                                    className={className || undefined}
                                />
                            </Space>
                        </Card>

                        <Divider />

                        {/* Code Preview */}
                        <Card title="Props Code Preview" size="small">
                            <pre style={{
                                background: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '4px',
                                overflow: 'auto'
                            }}>
                                {`<TipTapInput
    value="${template}"
    onChange={(value) => setTemplate(value)}
    options={${JSON.stringify(options)}}
    onOptionsChange={(newOptions) => setOptions(newOptions)}
    size="${size}"
    maxBlankLength={${maxBlankLength}}
    maxBlankCount={${maxBlankCount}}
    disabled={${disabled}}
    hasBlank={${hasBlank}}
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${autoFocus ? 'autoFocus={true}' : ''}
    ${className ? `className="${className}"` : ''}
/>`}
                            </pre>
                        </Card>
                    </Space>
                </Card>
            </div>
        </div>
    )
}

export default App
