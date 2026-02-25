import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Button, Dialog } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../../shared/services/hotelService';
import { HotelStatus, IHotel } from '../../../../shared/types';
import { LocalStorage, STORAGE_KEYS } from '../../../../shared/utils/LocalStorage';
import './index.scss';

const REJECT_REASONS = [
  '信息不完整',
  '图片不符合规范',
  '价格异常',
  '地址信息有误',
  '酒店资质存疑',
  '其他原因'
];

const AuditDetail = () => {
  const router = useRouter();
  const hotelId = router.params.id || LocalStorage.get<string>(STORAGE_KEYS.VIEW_HOTEL_ID) || '';
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOtherReason, setRejectOtherReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [offlineDialogVisible, setOfflineDialogVisible] = useState(false);
  const [offlineReason, setOfflineReason] = useState('');
  const [offlineOtherReason, setOfflineOtherReason] = useState('');

  useEffect(() => {
    if (!hotelId) return;
    hotelService.getHotelById(hotelId).then(setHotel);
  }, [hotelId]);

  const handleApprove = async () => {
    if (!hotel) return;
    try {
      Taro.showLoading({ title: '审核中...' });
      await hotelService.approveHotel(hotel.id);
      const updated = await hotelService.getHotelById(hotel.id);
      setHotel(updated);
      Taro.showToast({ title: '审核通过', icon: 'success' });
    } finally {
      Taro.hideLoading();
    }
  };

  const handleConfirmReject = async () => {
    if (!hotel) return;
    const finalReason = rejectReason === '其他原因' ? rejectOtherReason : rejectReason;
    if (!finalReason) {
      Taro.showToast({ title: '请选择或输入驳回原因', icon: 'none' });
      return;
    }
    try {
      Taro.showLoading({ title: '处理中...' });
      await hotelService.rejectHotel(hotel.id, finalReason);
      const updated = await hotelService.getHotelById(hotel.id);
      setHotel(updated);
      setRejectDialogVisible(false);
      Taro.showToast({ title: '已驳回', icon: 'success' });
    } finally {
      Taro.hideLoading();
    }
  };

  const handleConfirmOffline = async () => {
    if (!hotel) return;
    const finalReason = offlineReason === '其他原因' ? offlineOtherReason : offlineReason;
    if (!finalReason) {
      Taro.showToast({ title: '请选择或输入下线原因', icon: 'none' });
      return;
    }
    try {
      Taro.showLoading({ title: '处理中...' });
      await hotelService.offlineHotel(hotel.id);
      const updated = await hotelService.getHotelById(hotel.id);
      setHotel(updated);
      setOfflineDialogVisible(false);
      Taro.showToast({ title: '已下线', icon: 'success' });
    } finally {
      Taro.hideLoading();
    }
  };

  if (!hotel) {
    return (
      <View className='audit-detail'>
        <View className='detail-empty'>暂无酒店信息</View>
      </View>
    );
  }

  const statusMap = {
    [HotelStatus.PENDING]: { text: '审核中', color: '#f0a23a' },
    [HotelStatus.PUBLISHED]: { text: '已发布', color: '#2f9b5a' },
    [HotelStatus.REJECTED]: { text: '已驳回', color: '#e0524d' },
    [HotelStatus.OFFLINE]: { text: '已下线', color: '#8b8f97' },
  };
  const status = statusMap[hotel.status] || { text: '未知', color: '#6b7280' };

  return (
    <View className='audit-detail'>
      <View className='detail-hero'>
        <View>
          <Text className='detail-title'>酒店详情</Text>
          <Text className='detail-subtitle'>只读查看，支持审核操作</Text>
        </View>
        <Button className='back-btn' onClick={() => Taro.navigateBack()}>
          返回列表
        </Button>
        <View className='detail-status' style={{ background: status.color }}>
          <Text>{status.text}</Text>
        </View>
      </View>

      <View className='detail-card'>
        <View className='detail-cover'>
          {hotel.imageUrl ? (
            <Image className='cover-img' src={hotel.imageUrl} mode='aspectFill' />
          ) : (
            <View className='cover-placeholder'>
              <Text>HOTEL</Text>
            </View>
          )}
        </View>
        <View className='detail-info'>
          <Text className='hotel-name'>{hotel.nameCn}</Text>
          <Text className='hotel-name-en'>{hotel.nameEn}</Text>
          <Text className='hotel-addr'>{hotel.address}</Text>
          <View className='hotel-meta'>
            <Text>星级：{hotel.star}</Text>
            <Text>起价：¥{hotel.price}</Text>
            <Text>开业：{hotel.openingTime}</Text>
          </View>
          {hotel.tags && hotel.tags.length > 0 ? (
            <View className='hotel-tags'>
              {hotel.tags.map(tag => (
                <Text key={tag} className='tag-chip'>{tag}</Text>
              ))}
            </View>
          ) : null}
          {hotel.nearbyIntro ? (
            <Text className='nearby-intro'>周边简介：{hotel.nearbyIntro}</Text>
          ) : null}
          <Text className='hotel-upload'>上传商户：{hotel.uploadedBy}</Text>
          {hotel.rejectionReason && hotel.status === HotelStatus.REJECTED ? (
            <Text className='reject-reason'>驳回原因：{hotel.rejectionReason}</Text>
          ) : null}
        </View>
      </View>

      <View className='detail-card'>
        <Text className='section-title'>房型信息</Text>
        <View className='room-list'>
          {(hotel.rooms || []).map((room) => (
            <View key={room.id} className='room-item'>
              <View className='room-head'>
                <Text className='room-name'>{room.name}</Text>
                <Text className='room-price'>¥{room.price}</Text>
              </View>
              <View className='room-meta'>
                <Text>面积：{room.size}</Text>
                <Text>可住：{room.capacity}人</Text>
                <Text>床型：{room.bedType}</Text>
              </View>
              <Text className='room-policy'>{room.policy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='detail-actions'>
        {hotel.status === HotelStatus.PENDING && (
          <>
            <Button className='action-btn approve-btn' onClick={handleApprove}>通过</Button>
            <Button className='action-btn reject-btn' onClick={() => setRejectDialogVisible(true)}>拒绝</Button>
          </>
        )}
        {hotel.status === HotelStatus.PUBLISHED && (
          <Button className='action-btn offline-btn' onClick={() => setOfflineDialogVisible(true)}>下线</Button>
        )}
      </View>

      <Dialog
        title='拒绝原因'
        visible={rejectDialogVisible}
        onClose={() => setRejectDialogVisible(false)}
        onCancel={() => setRejectDialogVisible(false)}
        onConfirm={handleConfirmReject}
        cancelText='取消'
        confirmText='确认拒绝'
      >
        <View className='dialog-content'>
          <View className='reason-options'>
            {REJECT_REASONS.map((reason) => (
              <View
                key={reason}
                className={`reason-item ${rejectReason === reason ? 'active' : ''}`}
                onClick={() => {
                  setRejectReason(reason);
                  setShowOtherInput(reason === '其他原因');
                }}
              >
                <Text>{reason}</Text>
              </View>
            ))}
          </View>
          {showOtherInput && (
            <View className='other-reason-input'>
              <Text>{rejectOtherReason || '请输入其他原因'}</Text>
            </View>
          )}
        </View>
      </Dialog>

      <Dialog
        title='下线原因'
        visible={offlineDialogVisible}
        onClose={() => setOfflineDialogVisible(false)}
        onCancel={() => setOfflineDialogVisible(false)}
        onConfirm={handleConfirmOffline}
        cancelText='取消'
        confirmText='确认下线'
      >
        <View className='dialog-content'>
          <View className='reason-options'>
            {REJECT_REASONS.map((reason) => (
              <View
                key={reason}
                className={`reason-item ${offlineReason === reason ? 'active' : ''}`}
                onClick={() => {
                  setOfflineReason(reason);
                  setShowOtherInput(reason === '其他原因');
                }}
              >
                <Text>{reason}</Text>
              </View>
            ))}
          </View>
          <View className='other-reason-input'>
            <Text>{offlineOtherReason || '请输入其他原因'}</Text>
          </View>
        </View>
      </Dialog>
    </View>
  );
};

export default AuditDetail;
