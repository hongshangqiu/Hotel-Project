import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Tabs, TabPane, Button, Dialog, Empty } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { IHotel } from '../../../shared/types/hotel';
import { UserRole } from '../../../shared/types';
import { useStore } from '../../../shared/store';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import './index.scss';

// 预设的驳回原因选项
const REJECT_REASONS = [
  '信息不完整',
  '图片不符合规范',
  '价格异常',
  '地址信息有误',
  '酒店资质存疑',
  '其他原因'
];

const AuditPage = () => {
  const { user } = useStore()
  const [activeTab, setActiveTab] = useState(0);
  const [pendingList, setPendingList] = useState<IHotel[]>([]);
  const [publishedList, setPublishedList] = useState<IHotel[]>([]);
  const [rejectedList, setRejectedList] = useState<IHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPending, setTotalPending] = useState(0);
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);

  // 搜索相关状态
  const [searchKeyword, setSearchKeyword] = useState('');

  // 驳回弹窗相关状态
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<IHotel | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOtherReason, setRejectOtherReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  // 下线弹窗相关状态
  const [offlineDialogVisible, setOfflineDialogVisible] = useState(false);
  const [offlineReason, setOfflineReason] = useState('');
  const [offlineOtherReason, setOfflineOtherReason] = useState('');

  // 加载各列表数据
  // 按 Tab 按需加载：0=待审核 1=已通过 2=已拒绝
  const loadData = async (tab: number) => {
    setLoading(true);
    try {
      if (tab === 0) {
        const pendingRes = await hotelService.getPendingAuditList(1, 100);
        setPendingList(pendingRes.list);
        setTotalPending(pendingRes.total);
        return;
      }

      if (tab === 1) {
        const publishedRes = await hotelService.getPublishedList(1, 100);
        setPublishedList(publishedRes.list);
        setTotalPublished(publishedRes.total);
        return;
      }

      if (tab === 2) {
        const rejectedRes = await hotelService.getRejectedList(1, 100);
        setRejectedList(rejectedRes.list);
        setTotalRejected(rejectedRes.total);
        return;
      }
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // 权限校验
    if (user.role !== UserRole.ADMIN) {
      Taro.showToast({ title: '您无权限访问此页面', icon: 'none' });
      Taro.redirectTo({ url: '/pages/admin/manage/index' });
      return;
    }

    // 按当前 tab 加载数据
    loadData(activeTab);
  }, [user, activeTab]);

  // 审核通过
  const handleApprove = async (hotel: IHotel) => {
    try {
      Taro.showLoading({ title: '审核中...' });
      const result = await hotelService.approveHotel(hotel.id);
      Taro.hideLoading();
      if (result) {
        Taro.showToast({ title: '审核通过', icon: 'success' });
        loadData(activeTab);
      }
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 打开驳回弹窗
  const handleOpenReject = (hotel: IHotel) => {
    setSelectedHotel(hotel);
    setRejectReason('');
    setRejectOtherReason('');
    setShowOtherInput(false);
    setRejectDialogVisible(true);
  };

  // 确认驳回
  const handleConfirmReject = async () => {
    if (!selectedHotel) return;

    const finalReason = rejectReason === '其他原因' ? rejectOtherReason : rejectReason;
    if (!finalReason) {
      Taro.showToast({ title: '请选择或输入驳回原因', icon: 'none' });
      return;
    }

    try {
      Taro.showLoading({ title: '处理中...' });
      const result = await hotelService.rejectHotel(selectedHotel.id, finalReason);
      Taro.hideLoading();
      setRejectDialogVisible(false);
      if (result) {
        Taro.showToast({ title: '已驳回', icon: 'success' });
        loadData(activeTab);
      }
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 打开下线弹窗
  const handleOpenOffline = (hotel: IHotel) => {
    setSelectedHotel(hotel);
    setOfflineReason('');
    setOfflineOtherReason('');
    setShowOtherInput(false);
    setOfflineDialogVisible(true);
  };

  // 确认下线
  const handleConfirmOffline = async () => {
    if (!selectedHotel) return;

    const finalReason = offlineReason === '其他原因' ? offlineOtherReason : offlineReason;
    if (!finalReason) {
      Taro.showToast({ title: '请选择或输入下线原因', icon: 'none' });
      return;
    }

    try {
      Taro.showLoading({ title: '处理中...' });
      const result = await hotelService.offlineHotel(selectedHotel.id);
      Taro.hideLoading();
      setOfflineDialogVisible(false);
      if (result) {
        Taro.showToast({ title: '已下线', icon: 'success' });
        loadData(activeTab);
      }
    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 搜索已通过列表
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadData(activeTab);
      return;
    }

    try {
      setLoading(true);
      const allPublished = await hotelService.getPublishedList(1, 100);
      const keyword = searchKeyword.toLowerCase();
      const filtered = allPublished.list.filter(hotel =>
        hotel.nameCn.toLowerCase().includes(keyword) ||
        hotel.nameEn.toLowerCase().includes(keyword)
      );
      setPublishedList(filtered);
      setTotalPublished(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  // 渲染待审核列表
  const renderPendingList = () => {
    if (pendingList.length === 0) {
      return <Empty description="暂无待审核数据" />;
    }

    return (
      <View className="hotel-list">
        {pendingList.map((hotel) => (
          <View key={hotel.id} className="hotel-card">
            <Image
              className="hotel-image"
              src={hotel.imageUrl || 'https://picsum.photos/200/150'}
              mode="aspectFill"
            />
            <View className="hotel-info">
              <Text className="hotel-name">{hotel.nameCn}</Text>
              <Text className="hotel-name-en">{hotel.nameEn}</Text>
              <Text className="hotel-address">{hotel.address}</Text>
              <View className="hotel-meta">
                <Text className="hotel-price">¥{hotel.price}/晚</Text>
                <Text className="hotel-star">{hotel.star}星级</Text>
              </View>
              <Text className="hotel-user">上传用户: 商户{hotel.id}</Text>
            </View>
            <View className="hotel-actions">
              <Button
                type="default"
                size="small"
                className="action-btn view-btn"
                onClick={() => {
                  LocalStorage.set(STORAGE_KEYS.VIEW_HOTEL_ID, hotel.id);
                  Taro.navigateTo({ url: '/pages/admin/audit/detail/index' });
                }}
              >
                查看
              </Button>
              <Button
                type="success"
                size="small"
                className="action-btn approve-btn"
                onClick={() => handleApprove(hotel)}
              >
                通过
              </Button>
              <Button
                type="danger"
                size="small"
                className="action-btn reject-btn"
                onClick={() => handleOpenReject(hotel)}
              >
                拒绝
              </Button>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // 渲染已通过列表
  const renderPublishedList = () => {
    return (
      <View>
        {/* 搜索栏 */}
        <View className="search-bar">
          <Input
            className="search-input"
            placeholder="搜索酒店名称"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={handleSearch}
          />
          <Button type="primary" size="small" onClick={handleSearch}>
            搜索
          </Button>
        </View>

        {publishedList.length === 0 ? (
          <Empty description="暂无已通过数据" />
        ) : (
          <View className="hotel-list">
            {publishedList.map((hotel) => (
              <View key={hotel.id} className="hotel-card">
                <Image
                  className="hotel-image"
                  src={hotel.imageUrl || 'https://picsum.photos/200/150'}
                  mode="aspectFill"
                />
                <View className="hotel-info">
                  <Text className="hotel-name">{hotel.nameCn}</Text>
                  <Text className="hotel-name-en">{hotel.nameEn}</Text>
                  <Text className="hotel-address">{hotel.address}</Text>
                  <View className="hotel-meta">
                    <Text className="hotel-price">¥{hotel.price}/晚</Text>
                    <Text className="hotel-star">{hotel.star}星级</Text>
                  </View>
                  <Text className="hotel-user">上传用户: 商户{hotel.id}</Text>
                </View>
                <View className="hotel-actions">
                  <Button
                    type="default"
                    size="small"
                    className="action-btn view-btn"
                    onClick={() => {
                      LocalStorage.set(STORAGE_KEYS.VIEW_HOTEL_ID, hotel.id);
                      Taro.navigateTo({ url: '/pages/admin/audit/detail/index' });
                    }}
                  >
                    查看
                  </Button>
                  <Button
                    type="warning"
                    size="small"
                    className="action-btn offline-btn"
                    onClick={() => handleOpenOffline(hotel)}
                  >
                    下线
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 渲染已拒绝列表
  const renderRejectedList = () => {
    if (rejectedList.length === 0) {
      return <Empty description="暂无已拒绝数据" />;
    }

    return (
      <View className="hotel-list">
        {rejectedList.map((hotel) => (
          <View key={hotel.id} className="hotel-card rejected">
            <Image
              className="hotel-image"
              src={hotel.imageUrl || 'https://picsum.photos/200/150'}
              mode="aspectFill"
            />
            <View className="hotel-info">
              <Text className="hotel-name">{hotel.nameCn}</Text>
              <Text className="hotel-name-en">{hotel.nameEn}</Text>
              <Text className="hotel-address">{hotel.address}</Text>
              <View className="hotel-meta">
                <Text className="hotel-price">¥{hotel.price}/晚</Text>
                <Text className="hotel-star">{hotel.star}星级</Text>
              </View>
              <Text className="hotel-user">上传用户: 商户{hotel.id}</Text>
              {hotel.rejectionReason && (
                <Text className="reject-reason">驳回原因: {hotel.rejectionReason}</Text>
              )}
            </View>
            <View className="hotel-actions">
              <Button
                type="default"
                size="small"
                className="action-btn view-btn"
                onClick={() => {
                  LocalStorage.set(STORAGE_KEYS.VIEW_HOTEL_ID, hotel.id);
                  Taro.navigateTo({ url: '/pages/admin/audit/detail/index' });
                }}
              >
                查看
              </Button>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="audit-page">
      {/* 页面头部 */}
      <View className="page-header">
        <Text className="page-title">审核管理</Text>
        <Text className="page-desc">管理酒店上线审核与发布</Text>
      </View>

      {/* 统计卡片 */}
      <View className="stats-cards">
        <View className="stats-card pending" onClick={() => setActiveTab(0)}>
          <Text className="stats-count">{totalPending}</Text>
          <Text className="stats-label">待审核</Text>
        </View>
        <View className="stats-card approved" onClick={() => setActiveTab(1)}>
          <Text className="stats-count">{totalPublished}</Text>
          <Text className="stats-label">已通过</Text>
        </View>
        <View className="stats-card rejected" onClick={() => setActiveTab(2)}>
          <Text className="stats-count">{totalRejected}</Text>
          <Text className="stats-label">已拒绝</Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="tabs-container">
        <Tabs
          value={activeTab}
          onChange={(index) => setActiveTab(index as number)}
          className="audit-tabs"
        >
          <TabPane title={`待审核 (${totalPending})`}>
            {renderPendingList()}
          </TabPane>
          <TabPane title={`已通过 (${totalPublished})`}>
            {renderPublishedList()}
          </TabPane>
          <TabPane title={`已拒绝 (${totalRejected})`}>
            {renderRejectedList()}
          </TabPane>
        </Tabs>
      </View>

      {/* 驳回原因弹窗 */}
      <Dialog
        title="拒绝原因"
        visible={rejectDialogVisible}
        onClose={() => setRejectDialogVisible(false)}
        onCancel={() => setRejectDialogVisible(false)}
        onConfirm={handleConfirmReject}
        cancelText="取消"
        confirmText="确认拒绝"
      >
        <View className="dialog-content">
          <View className="reason-options">
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
            <Input
              className="other-reason-input"
              placeholder="请输入其他原因"
              value={rejectOtherReason}
              onInput={(e) => setRejectOtherReason(e.detail.value)}
            />
          )}
        </View>
      </Dialog>

      {/* 下线原因弹窗 */}
      <Dialog
        title="下线原因"
        visible={offlineDialogVisible}
        onClose={() => setOfflineDialogVisible(false)}
        onCancel={() => setOfflineDialogVisible(false)}
        onConfirm={handleConfirmOffline}
        cancelText="取消"
        confirmText="确认下线"
      >
        <View className="dialog-content">
          <View className="reason-options">
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
          <Input
            className="other-reason-input"
            placeholder="请输入其他原因"
            value={offlineOtherReason}
            onInput={(e) => setOfflineOtherReason(e.detail.value)}
          />
        </View>
      </Dialog>

      {loading && (
        <View className="loading-mask">
          <Text>加载中...</Text>
        </View>
      )}
    </View>
  );
};

export default AuditPage;
