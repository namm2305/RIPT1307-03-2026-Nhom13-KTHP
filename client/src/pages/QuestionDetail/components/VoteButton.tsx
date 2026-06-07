import React from 'react';
import { Button, Space, Typography } from 'antd';
import { LikeOutlined, LikeFilled, DislikeOutlined, DislikeFilled } from '@ant-design/icons';

const { Text } = Typography;

interface VoteButtonProps {
    likes: number;
    dislikes: number;
    userVote: 'up' | 'down' | null;
    onVote: (type: 'up' | 'down') => void;
    size?: 'small' | 'default';
    horizontal?: boolean;
}

const VoteButton: React.FC<VoteButtonProps> = ({
    likes,
    dislikes,
    userVote,
    onVote,
    size = 'default',
    horizontal = true
}) => {
    const iconSize = size === 'small' ? '15px' : '18px';
    const buttonPadding = size === 'small' ? '2px 6px' : '4px 10px';

    return (
        <Space direction={horizontal ? 'horizontal' : 'vertical'} align="center" size={8}>
            <Button
                type="text"
                onClick={() => onVote('up')}
                style={{
                    color: userVote === 'up' ? '#1890ff' : '#8c8c8c',
                    padding: buttonPadding,
                    height: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    background: userVote === 'up' ? '#e6f7ff' : 'transparent'
                }}
            >
                {userVote === 'up' ? <LikeFilled style={{ fontSize: iconSize }} /> : <LikeOutlined style={{ fontSize: iconSize }} />}
                <Text style={{ color: userVote === 'up' ? '#1890ff' : '#8c8c8c', fontWeight: userVote === 'up' ? 'bold' : 'normal' }}>
                    {likes}
                </Text>
            </Button>

            <Button
                type="text"
                onClick={() => onVote('down')}
                style={{
                    color: userVote === 'down' ? '#1890ff' : '#8c8c8c',
                    padding: buttonPadding,
                    height: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '4px',
                    background: userVote === 'down' ? '#e6f7ff' : 'transparent'
                }}
            >
                {userVote === 'down' ? <DislikeFilled style={{ fontSize: iconSize }} /> : <DislikeOutlined style={{ fontSize: iconSize }} />}
                <Text style={{ color: userVote === 'down' ? '#1890ff' : '#8c8c8c', fontWeight: userVote === 'down' ? 'bold' : 'normal' }}>
                    {dislikes}
                </Text>
            </Button>
        </Space>
    );
};

export default VoteButton;
