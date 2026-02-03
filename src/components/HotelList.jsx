import React from 'react';

const hotels = [
  { id: 1, name: "豪华酒店", price: 200, stars: 5 },
  { id: 2, name: "经济型酒店", price: 80, stars: 3 },
  // 更多酒店...
];

function HotelList({ hotels }) {
  return (
    <div className="hotel-list">
      {hotels.map(hotel => (
        <div key={hotel.id} className="hotel-item">
          <h3>{hotel.name}</h3>
          <p>价格: ${hotel.price}</p>
          <p>星级: {hotel.stars}</p>
        </div>
      ))}
    </div>
  );
}

export default HotelList;