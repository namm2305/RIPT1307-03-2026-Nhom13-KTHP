import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Typography } from 'antd';
import { TeamOutlined, UserOutlined, QuestionCircleOutlined, MessageOutlined, TagsOutlined, LockOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import axios from 'axios';

const { Title } = Typography;
const API_BASE = 'http://localhost:5050/api';

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>;
  }

  const roleData = stats.charts.roles.map((r: any) => ({
    name: r.role === 'student' ? 'Sinh viên' : r.role === 'lecturer' ? 'Giảng viên' : r.role === 'moderator' ? 'Kiểm duyệt viên' : 'Quản trị viên',
    value: r.count
  }));

  const subjectData = stats.charts.subjects.map((s: any) => ({
    name: s.subject,
    "Câu hỏi": s.count
  }));

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Tổng thành viên" value={stats.stats.users.total} prefix={<TeamOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Câu hỏi" value={stats.stats.questions} prefix={<QuestionCircleOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Bình luận" value={stats.stats.comments} prefix={<MessageOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Tags" value={stats.stats.tags} prefix={<TagsOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Bị khóa" value={stats.stats.users.inactive} prefix={<LockOutlined style={{ color: '#f5222d' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic title="Đang hoạt động" value={stats.stats.users.active} prefix={<UserOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Số lượng người dùng theo vai trò" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '100%', height: 300 }}>
              <Pie
                data={roleData}
                angleField="value"
                colorField="name"
                radius={0.8}
                label={{
                  text: (d: any) => `${d.name}: ${d.value}`,
                  position: 'spider',
                }}
                legend={{
                  color: {
                    title: false,
                    position: 'bottom',
                  },
                }}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Số lượng câu hỏi theo môn học" bordered={false} style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '100%', height: 300 }}>
              <Column
                data={subjectData}
                xField="name"
                yField="Câu hỏi"
                color="#1890ff"
                label={{
                  text: (d: any) => d['Câu hỏi'],
                  position: 'top',
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
