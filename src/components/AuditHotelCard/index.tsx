import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback } from 'react';
import { Button } from '@nutui/nutui-react-taro';
import { IHotel } from '../../shared/types';
import { LocalStorage, STORAGE_KEYS } from '../../shared/utils/LocalStorage';
import StarRating from '../StarRating';
import './index.scss';

interface AuditHotelCardProps {
  hotel: IHotel;
  type: 'pending' | 'published' | 'rejected' | 'offline';
  onView?: (hotel: IHotel) => void;
  onApprove?: (hotel: IHotel) => void;
  onReject?: (hotel: IHotel) => void;
  onOffline?: (hotel: IHotel) => void;
  onOnline?: (hotel: IHotel) => void;
  showRejectReason?: boolean;
  showUploadUser?: boolean;
}

// 使用 memo 包装组件，只有当关键属性变化时才重新渲染
const AuditHotelCard = memo<AuditHotelCardProps>(({
  hotel,
  type,
  onView,
  onApprove,
  onReject,
  onOffline,
  onOnline,
  showRejectReason = false,
  showUploadUser = true,
}) => {
  const handleView = useCallback(() => {
    onView?.(hotel);
  }, [onView, hotel]);

  const handleApprove = useCallback(() => {
    onApprove?.(hotel);
  }, [onApprove, hotel]);

  const handleReject = useCallback(() => {
    onReject?.(hotel);
  }, [onReject, hotel]);

  const handleOffline = useCallback(() => {
    onOffline?.(hotel);
  }, [onOffline, hotel]);

  const handleOnline = useCallback(() => {
    onOnline?.(hotel);
  }, [onOnline, hotel]);

  const cardClassName = `hotel-card ${type === 'rejected' ? 'rejected' : ''} ${type === 'offline' ? 'offline' : ''}`;

  return (
    <View key={hotel.id} className={cardClassName}>
      <Image
        className="hotel-image"
        src={hotel.imageUrl || 'https://picsum.photos/200/150'}
        mode="aspectFill"
        lazyLoad={true}
      />
      <View className="hotel-info">
        <Text className="hotel-name">{hotel.nameCn}</Text>
        <Text className="hotel-name-en">{hotel.nameEn}</Text>
        <Text className="hotel-address">{hotel.address}</Text>
        <View className="hotel-meta">
          <Text className="hotel-price">¥{hotel.price}/晚</Text>
          <Text className="hotel-star"><StarRating rating={hotel.star} size="small" /></Text>
        </View>
        {showUploadUser && (
          <Text className="hotel-user">上传用户: {hotel.uploadedBy}</Text>
        )}
        {showRejectReason && hotel.rejectionReason && (
          <Text className="reject-reason">
            {type === 'rejected' ? '驳回原因: ' : '下线原因: '}
            {hotel.rejectionReason}
          </Text>
        )}
      </View>
      <View className="hotel-actions">
        <Button
          type="default"
          size="small"
          className="action-btn view-btn"
          onClick={handleView}
        >
          查看
        </Button>
        
        {type === 'pending' && (
          <>
            <Button
              type="success"
              size="small"
              className="action-btn approve-btn"
              onClick={handleApprove}
            >
              通过
            </Button>
            <Button
              type="danger"
              size="small"
              className="action-btn reject-btn"
              onClick={handleReject}
            >
              拒绝
            </Button>
          </>
        )}
        
        {type === 'published' && (
          <Button
            type="warning"
            size="small"
            className="action-btn offline-btn"
            onClick={handleOffline}
          >
            下线
          </Button>
        )}
        
        {type === 'offline' && (
          <Button
            type="success"
            size="small"
            className="action-btn online-btn"
            onClick={handleOnline}
          >
            重新上线
          </Button>
        )}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：只有当酒店 ID 或状态相关字段变化时才重新渲染
  return (
    prevProps.hotel.id === nextProps.hotel.id &&
    prevProps.hotel.status === nextProps.hotel.status &&
    prevProps.hotel.nameCn === nextProps.hotel.nameCn &&
    prevProps.hotel.price === nextProps.hotel.price &&
    prevProps.type === nextProps.type
  );
});

// 设置 displayName 以便于调试
AuditHotelCard.displayName = 'AuditHotelCard';

export default AuditHotelCard;
