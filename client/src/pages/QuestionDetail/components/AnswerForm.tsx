import React, { useState } from 'react';
import { Card, Button, Input, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

interface AnswerFormProps {
    onSubmit: (content: string) => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ onSubmit }) => {
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        if (!content.trim()) return;
        onSubmit(content.trim());
        setContent('');
    };

    return (
        <Card style={{ borderRadius: '8px' }}>
            <Title level={5} style={{ marginTop: 0 }}>Viết câu trả lời</Title>
            <TextArea
                autoSize={{ minRows: 4, maxRows: 12 }}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Chia sẻ kiến thức của bạn..."
                style={{ marginBottom: '12px', resize: 'none' }}
            />
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmit}
                size="large"
            >
                Gửi câu trả lời
            </Button>
        </Card>
    );
};

export default AnswerForm;
