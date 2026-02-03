// src/App.jsx
import React, { useState } from 'react';
import { Input, DatePicker, Button, Slider, Rate, Card, Row, Col, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './App.css';

const { RangePicker } = DatePicker;
const { Title } = Typography;

// 模拟酒店数据（实际项目中应来自 API）
const mockHotels = [
  {
    id: 1,
    name: '西湖国宾馆',
    price: 899,
    stars: 5,
    location: '杭州 · 西湖区',
    image: 'https://via.placeholder.com/300x200?text=西湖国宾馆'
  },
  {
    id: 2,
    name: '全季酒店',
    price: 328,
    stars: 4,
    location: '杭州 · 上城区',
    image: 'https://via.placeholder.com/300x200?text=全季酒店'
  },
  {
    id: 3,
    name: '如家精选酒店',
    price: 198,
    stars: 3,
    location: '杭州 · 拱墅区',
    image: 'https://via.placeholder.com/300x200?text=如家精选'
  },
  {
    id: 4,
    name: '亚朵酒店',
    price: 458,
    stars: 4,
    location: '杭州 · 下城区',
    image: 'https://via.placeholder.com/300x200?text=亚朵酒店'
  }
];

function App() {
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minStars, setMinStars] = useState(0);

  const filteredHotels = mockHotels.filter(hotel => {
    const matchesDestination = destination === '' || hotel.name.includes(destination) || hotel.location.includes(destination);
    const matchesPrice = hotel.price >= priceRange[0] && hotel.price <= priceRange[1];
    const matchesStars = hotel.stars >= minStars;
    return matchesDestination && matchesPrice && matchesStars;
  });

  const handleSearch = () => {
    // 实际项目中可调用 API
    console.log('搜索:', { destination, dateRange, priceRange, minStars });
  };

  return (
    <div className="app-container">
      <div className="header">
        <Title level={2} style={{ color: '#fff', margin: 0 }}>🏨 易宿酒店</Title>
      </div>

      {/* 搜索区域 */}
      <Card className="search-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="目的地 / 酒店名"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={10}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['入住日期', '退房日期']}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button type="primary" block onClick={handleSearch}>
              搜索酒店
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 筛选区域 */}
      <div className="filter-section">
        <div className="filter-item">
          <label>价格范围：¥{priceRange[0]} - ¥{priceRange[1]}</label>
          <Slider
            range
            min={0}
            max={1000}
            value={priceRange}
            onChange={setPriceRange}
            style={{ marginTop: 8 }}
          />
        </div>
        <div className="filter-item">
          <label>最低星级：</label>
          <Rate
            allowHalf={false}
            count={5}
            value={minStars}
            onChange={setMinStars}
            style={{ fontSize: 18, marginTop: 4 }}
          />
          {minStars > 0 && <span style={{ marginLeft: 8 }}>{minStars} 星及以上</span>}
        </div>
      </div>

      {/* 酒店列表 */}
      <div className="hotel-list-section">
        <Title level={4}>找到 {filteredHotels.length} 家酒店</Title>
        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <Col key={hotel.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={<img alt={hotel.name} src={hotel.image} style={{ height: 160, objectFit: 'cover' }} />}
                  style={{ borderRadius: 12 }}
                >
                  <Card.Meta
                    title={hotel.name}
                    description={
                      <>
                        <p>{hotel.location}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Rate disabled value={hotel.stars} />
                          <strong>¥{hotel.price}<small>/晚</small></strong>
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <p style={{ textAlign: 'center', color: '#999' }}>暂无符合条件的酒店</p>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}

export default App;