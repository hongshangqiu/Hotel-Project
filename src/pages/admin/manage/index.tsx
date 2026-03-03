import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Rate, TextArea, Row, Col, Tag } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { HotelStatus, IHotel, IHotelRoom, IPriceConfig } from '../../../shared/types/index';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import { useStore } from '../../../shared/store';
import { TAG_OPTIONS } from '../../../shared/constants';
import './index.scss';

const HotelManage = () => {
  const router = useRouter();
  const hotelId = router.params.id || LocalStorage.get<string>(STORAGE_KEYS.EDIT_HOTEL_ID) || '';
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [roomList, setRoomList] = useState<IHotelRoom[]>([]);
  const [currentStatus, setCurrentStatus] = useState<HotelStatus | null>(null);
  const { user } = useStore();
  const [originalHotel, setOriginalHotel] = useState<IHotel | null>(null);
  const [tagOptions, setTagOptions] = useState<string[]>([...TAG_OPTIONS]);
  const [customTag, setCustomTag] = useState('');

  // 定位状态
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // 价格配置状态
  const [priceConfig, setPriceConfig] = useState<IPriceConfig>({
    weekendMultiplier: 1.1,
    holidayMultiplier: 1.2,
    datePriceOverrides: [],
    seasons: []
  });
  // 固定日期价格配置
  const [dateOverrides, setDateOverrides] = useState<{date: string, multiplier: number}[]>([]);
  // 添加新的日期价格
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideMultiplier, setNewOverrideMultiplier] = useState(1.2);

  // 草稿存储键名
  const DRAFT_KEY = 'hotel_draft';

  // 实时监测图片值
  const imageUrlWatch = Form.useWatch('imageUrl', form);
  const watchedTags = Form.useWatch('tags', form);
  const selectedTags = Array.isArray(watchedTags) ? watchedTags : [];

  // 自动保存草稿
  const saveDraft = () => {
    if (!isEdit && user) {
      const formData = form.getFieldsValue(true);
      const draft = {
        ...formData,
        rooms: roomList,
        savedAt: Date.now(),
        username: user.username,
      };
      LocalStorage.set(DRAFT_KEY, draft);
    }
  };

  // 加载草稿
  const loadDraft = () => {
    const draft = LocalStorage.get<any>(DRAFT_KEY);
    if (draft && !isEdit && !hotelId) {
      // 检查草稿是否是当前用户的
      if (draft.username === user?.username) {
        Taro.showModal({
          title: '发现未提交的草稿',
          content: '是否恢复之前未完成的填写？',
          success: (res) => {
            if (res.confirm) {
              form.setFieldsValue({
                nameCn: draft.nameCn || '',
                star: draft.star || 0,
                address: draft.address || '',
                imageUrl: draft.imageUrl || '',
                openingTime: draft.openingTime || '',
                nearbyIntro: draft.nearbyIntro || '',
                tags: draft.tags || [],
              });
              setRoomList(draft.rooms || []);
              Taro.showToast({ title: '已恢复草稿', icon: 'success' });
            } else {
              // 拒绝恢复则清除草稿
              LocalStorage.remove(DRAFT_KEY);
            }
          }
        });
      } else {
        // 不是当前用户的草稿，直接清除
        LocalStorage.remove(DRAFT_KEY);
      }
    }
  };

  // 清除草稿
  const clearDraft = () => {
    LocalStorage.remove(DRAFT_KEY);
  };

  useEffect(() => {
    // 检查登录状态
    if (!user) {
      Taro.redirectTo({ url: '/pages/admin/login/index' });
      return;
    }
    if (hotelId) {
      setIsEdit(true);
      loadHotelDetail(hotelId);
    } else {
      // 添加模式，加载草稿
      loadDraft();
    }
  }, [hotelId, user]);

  // 监听表单变化，自动保存草稿（添加模式下）
  useEffect(() => {
    if (!isEdit && !hotelId && user) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 1000); // 1秒防抖
      return () => clearTimeout(timer);
    }
  }, [roomList, isEdit, hotelId, user]);

  const loadHotelDetail = async (id: string) => {
    try {
      Taro.showLoading({ title: '加载中...' });
      const data = await hotelService.getHotelById(id);
      if (data) {
        form.setFieldsValue(data);
        setRoomList((data.rooms || []).map(room => ({
          ...room,
          size: String(room.size || '').replace(/㎡/g, ''),
        })));
        setCurrentStatus(data.status);
        setOriginalHotel(data);
        if (data.tags && data.tags.length > 0) {
          setTagOptions(prev => Array.from(new Set([...prev, ...data.tags || []])));
        }
        // 加载价格配置
        if (data.priceConfig) {
          setPriceConfig(data.priceConfig);
          setDateOverrides(data.priceConfig.datePriceOverrides?.map(d => ({
            date: d.date,
            multiplier: d.multiplier || 1
          })) || []);
        }
      }
    } finally {
      Taro.hideLoading();
    }
  };

  const normalizeRooms = (rooms: IHotelRoom[] = []) =>
    rooms.map(room => ({
      name: room.name || '',
      price: Number(room.price || 0),
      imageUrl: room.imageUrl || '',
      size: room.size || '',
      capacity: Number(room.capacity || 0),
      bedType: room.bedType || '',
      policy: room.policy || '',
    }));

  const hasChanges = (updates: any, original: IHotel | null) => {
    if (!original) return true;
    const current = {
      nameCn: original.nameCn || '',
      star: Number(original.star || 0),
      address: original.address || '',
      imageUrl: original.imageUrl || '',
      openingTime: original.openingTime || '',
      nearbyIntro: original.nearbyIntro || '',
      tags: original.tags || [],
      rooms: normalizeRooms(original.rooms || []),
    };
    const next = {
      nameCn: updates.nameCn || '',
      star: Number(updates.star || 0),
      address: updates.address || '',
      imageUrl: updates.imageUrl || '',
      openingTime: updates.openingTime || '',
      nearbyIntro: updates.nearbyIntro || '',
      tags: updates.tags || [],
      rooms: normalizeRooms(updates.rooms || []),
    };
    return JSON.stringify(current) !== JSON.stringify(next);
  };

  const addRoom = () => {
    const newRoom: IHotelRoom = {
      id: Date.now().toString(),
      name: '', price: 0, imageUrl: '', size: '', capacity: 2, bedType: '', policy: '需持证入住'
    };
    setRoomList([...roomList, newRoom]);
  };

  const updateRoom = (id: string, field: keyof IHotelRoom, value: any) => {
    setRoomList(roomList.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onFinish = async (values: any) => {
    // 检查用户登录状态
    if (!user || !user.username) {
      Taro.showToast({ title: '请重新登录', icon: 'none' });
      Taro.redirectTo({ url: '/pages/admin/login/index' });
      return;
    }
    if (values.nearbyIntro && values.nearbyIntro.length > 200) {
      Taro.showToast({ title: '周边简介不能超过200字', icon: 'none' });
      return;
    }
    if (roomList.length === 0) {
      Taro.showToast({ title: '请至少添加一个房型', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '正在提交...', mask: true });
    try {
      // 构建价格配置
      const finalPriceConfig: IPriceConfig = {
        ...priceConfig,
        datePriceOverrides: dateOverrides.map(d => ({
          date: d.date,
          multiplier: d.multiplier
        }))
      };
      
      const finalData = {
        ...values,
        rooms: roomList.map(room => ({
          ...room,
          size: room.size ? `${String(room.size).replace(/㎡/g, '')}㎡` : '',
        })),
        priceConfig: finalPriceConfig
      };
      if (isEdit && hotelId) {
        // 无论什么状态，都直接更新酒店信息
        if (currentStatus === HotelStatus.REJECTED && !hasChanges(finalData, originalHotel)) {
          Taro.showToast({ title: '驳回后需修改内容才能提交', icon: 'none' });
          return;
        }
        await hotelService.updateHotel(hotelId, {
          ...finalData,
          status: HotelStatus.PENDING,
          rejectionReason: undefined,
        });
        Taro.showToast({ title: '已提交，请等待审核', icon: 'success' });
      } else {
        await hotelService.createHotel({
          ...finalData,
          status: HotelStatus.PENDING,
          uploadedBy: user.username,
        });
        Taro.showToast({ title: '已提交，请等待审核', icon: 'success' });
      }
      setTimeout(() => {
        // 保存成功后清除编辑ID和草稿，让返回时重新加载数据
        LocalStorage.remove(STORAGE_KEYS.EDIT_HOTEL_ID);
        clearDraft();
        Taro.navigateBack();
      }, 1500);
    } catch (e) {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  const handleChooseCover = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      const path = res.tempFilePaths?.[0];
      if (path) {
        form.setFieldsValue({ imageUrl: path });
      }
    } catch (e) {
      // 用户取消或无权限
    }
  };

  const handleRemoveCover = () => {
    form.setFieldsValue({ imageUrl: '' });
  };

  const toggleTag = (tag: string) => {
    const raw = form.getFieldValue('tags');
    const current = Array.isArray(raw) ? raw : [];
    const next = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    form.setFieldsValue({ tags: next });
  };

  const handleRemoveTag = (tag: string) => {
    const raw = form.getFieldValue('tags');
    const current = Array.isArray(raw) ? raw : [];
    form.setFieldsValue({ tags: current.filter(t => t !== tag) });
  };

  const handleAddCustomTag = () => {
    const value = customTag.trim();
    if (!value) return;
    if (!tagOptions.includes(value)) {
      setTagOptions(prev => [...prev, value]);
    }
    const raw = form.getFieldValue('tags');
    const current = Array.isArray(raw) ? raw : [];
    if (!current.includes(value)) {
      form.setFieldsValue({ tags: [...current, value] });
    }
    setCustomTag('');
  };

  // 获取当前位置
  const handleGetLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError('');

    try {
      // 检查定位权限
      const settingRes = await Taro.getSetting();
      if (!settingRes.authSetting['scope.userLocation']) {
        // 请求定位权限
        const authRes = await Taro.authorize({ scope: 'scope.userLocation' });
        console.log('authorize res:', authRes);
      }

      // 获取位置
      const locationRes = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
      });

      const { latitude, longitude } = locationRes;

      // 使用腾讯地图逆地理编码获取地址
      const apiKey = 'AWBBZ-HTZKV-NGKPK-5U2CL-EK6WH-P6FIT';
      const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${apiKey}&get_poi=0`;

      try {
        const response = await Taro.request({
          url,
          method: 'GET',
        });

        if (response.data && response.data.status === 0) {
          const result = response.data.result;
          const address = result.address || '';
          const addressComponent = result.ad_info || {};
          const fullAddress = `${addressComponent.province || ''}${addressComponent.city || ''}${addressComponent.district || ''}${address}`;

          form.setFieldsValue({ address: fullAddress });
          Taro.showToast({ title: '定位成功', icon: 'success' });
        } else {
          // 如果没有配置API Key或请求失败，使用坐标作为提示
          form.setFieldsValue({ address: `经度:${longitude.toFixed(4)},纬度:${latitude.toFixed(4)}` });
          Taro.showToast({ title: '已获取坐标，请手动输入地址', icon: 'none' });
        }
      } catch (geoError) {
        console.error('逆地理编码失败:', geoError);
        // 逆地理编码失败时，使用坐标
        form.setFieldsValue({ address: `经度:${longitude.toFixed(4)},纬度:${latitude.toFixed(4)}` });
        Taro.showToast({ title: '已获取坐标，请手动输入地址', icon: 'none' });
      }
    } catch (error: any) {
      console.error('定位失败:', error);
      let errorMsg = '定位失败';

      if (error.errMsg?.includes('auth deny')) {
        errorMsg = '已拒绝定位权限';
      } else if (error.errMsg?.includes('authorize')) {
        errorMsg = '需要授权定位权限';
      }

      setLocationError(errorMsg);
      Taro.showToast({ title: errorMsg, icon: 'none' });
    } finally {
      setIsLocating(false);
    }
  }, [form]);

  const renderStatus = () => {
    if (!isEdit || !currentStatus) return null;
    const statusMap = {
      [HotelStatus.PENDING]: { text: '审核中', type: 'warning' },
      [HotelStatus.PUBLISHED]: { text: '已发布', type: 'success' },
      [HotelStatus.REJECTED]: { text: '已驳回', type: 'danger' },
      [HotelStatus.OFFLINE]: { text: '已下线', type: 'default' },
    };
    const config = statusMap[currentStatus];
    return (
      <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Tag type={config.type as any}>{config.text}</Tag>
        {currentStatus === HotelStatus.REJECTED && originalHotel?.rejectionReason ? (
          <Text style={{ color: '#d73a49', fontSize: '12px' }}>原因：{originalHotel.rejectionReason}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View className='admin-manage-container'>
      <View className='admin-manage-header'>
        <Text className='title-main'>{isEdit ? '编辑酒店信息' : '添加酒店'}</Text>
        {renderStatus()}
      </View>

      <View className='admin-manage-body'>
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={() => Taro.showToast({ title: '必填项未填满', icon: 'none' })}
          footer={
            <View className='admin-manage-footer'>
              <Button className='c-btn' onClick={() => {
                // 取消时，如果是添加模式则询问是否保存草稿
                if (!isEdit && !hotelId) {
                  Taro.showModal({
                    title: '提示',
                    content: '是否保存草稿以便下次继续？',
                    success: (res) => {
                      if (!res.confirm) {
                        clearDraft();
                      }
                      Taro.navigateBack();
                    }
                  });
                } else {
                  Taro.navigateBack();
                }
              }}>取消</Button>
              <Button className='s-btn' type='primary' onClick={() => form.submit()}>确认提交</Button>
            </View>
          }
        >
          <View className='manage-card'>
            <View className='manage-card-title'>基本信息</View>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label='中文名称' name='nameCn' rules={[{ required: true, message: '必填' }]}>
                  <Input placeholder='请输入酒店名' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='酒店星级' name='star' rules={[{ required: true, message: '必选' }]}>
                  <Rate />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label='详细地址' name='address' rules={[{ required: true, message: '必填' }]}>
              <Input
                className='address-input'
                placeholder='请输入详细地理位置'
              />
            </Form.Item>
            <View className='address-input-row'>
              <Button
                size='small'
                type='primary'
                loading={isLocating}
                onClick={handleGetLocation}
              >
                {isLocating ? '定位中' : '📍 获取定位'}
              </Button>
            </View>
            {locationError && <Text className='location-error'>{locationError}</Text>}
          </View>

          <View className='manage-card'>
            <View className='manage-card-title'>封面大图</View>
            <Form.Item name='imageUrl' rules={[{ required: true, message: '请上传图片' }]}>
              <View className='upload-row'>
                <Button size='small' type='primary' onClick={handleChooseCover}>选择图片</Button>
                <Button size='small' onClick={handleRemoveCover}>移除</Button>
              </View>
            </Form.Item>
            
            <View className='preview-box'>
              <Text className='p-tip'>上传实时预览：</Text>
              <View className='p-frame'>
                {imageUrlWatch ? (
                  <Image src={imageUrlWatch} mode='aspectFill' style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View className='p-none'>暂未选择图片</View>
                )}
              </View>
            </View>
          </View>

          <View className='manage-card'>
            <View className='manage-card-title flex-header'>
              <Text>房型管理</Text>
              <Button size='small' type='success' onClick={addRoom}>+ 增加房型</Button>
            </View>
            {roomList.map((room, index) => (
              <View key={room.id} className='room-row'>
                <View className='r-head'>
                  <Text>房型 #{index + 1}</Text>
                  <Text className='r-del' onClick={() => setRoomList(roomList.filter(r => r.id !== room.id))}>删除</Text>
                </View>
                <Row gutter={10}>
                  <Col span={8}><Input value={room.name} placeholder='名称' onChange={v => updateRoom(room.id, 'name', v)} /></Col>
                  <Col span={8}>
                    <View className='unit-input'>
                      <Input type='number' value={String(room.price)} placeholder='价格' onChange={v => updateRoom(room.id, 'price', v)} />
                      <Text className='unit-text'>元</Text>
                    </View>
                  </Col>
                  <Col span={8}>
                    <View className='unit-input'>
                      <Input value={room.size} placeholder='面积' onChange={v => updateRoom(room.id, 'size', v)} />
                      <Text className='unit-text'>㎡</Text>
                    </View>
                  </Col>
                </Row>
              </View>
            ))}
          </View>

          <View className='manage-card'>
            <View className='manage-card-title'>其他资料</View>
            <Form.Item label='开业日期' name='openingTime' rules={[{ required: true, message: '必填' }]}>
              <Input placeholder='如 2023-01' />
            </Form.Item>
            <Form.Item label='标签管理' name='tags'>
              <View className='tag-manager'>
                <View className='tag-selected'>
                  {(selectedTags as string[]).length > 0 ? (
                    (selectedTags as string[]).map(tag => (
                      <View key={tag} className='tag-chip'>
                        <Text>{tag}</Text>
                        <Text className='tag-remove' onClick={() => handleRemoveTag(tag)}>×</Text>
                      </View>
                    ))
                  ) : (
                    <Text className='tag-empty'>暂无已选标签</Text>
                  )}
                </View>
                <View className='tag-quick'>
                  {tagOptions.map(tag => (
                    <Text
                      key={tag}
                      className={`tag-quick-item ${(selectedTags as string[]).includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      + {tag}
                    </Text>
                  ))}
                </View>
              </View>
            </Form.Item>
            <View className='tag-input-row'>
              <Text className='tag-input-label'>自定义标签</Text>
              <Input
                value={customTag}
                placeholder='输入后点击添加'
                onChange={(val) => setCustomTag(val)}
              />
              <Button size='small' onClick={handleAddCustomTag}>添加</Button>
            </View>
            <Form.Item label='周边简介' name='nearbyIntro'>
              <TextArea maxLength={200} placeholder='周边交通、配套、地标等（不超过200字）' />
            </Form.Item>
          </View>

          {/* 价格调整配置 */}
          <View className='manage-card'>
            <View className='manage-card-title'>价格调整配置</View>
            
            <View className='price-config-section'>
              <Text className='section-label'>周末价格调整</Text>
              <View className='multiplier-input'>
                <Input
                  type='number'
                  value={String(priceConfig.weekendMultiplier || 1)}
                  onChange={(val) => setPriceConfig(prev => ({ ...prev, weekendMultiplier: Number(val) }))}
                />
                <Text className='unit-text'>倍 (如 1.1 = 加价10%)</Text>
              </View>
            </View>

            <View className='price-config-section'>
              <Text className='section-label'>节假日价格调整</Text>
              <View className='multiplier-input'>
                <Input
                  type='number'
                  value={String(priceConfig.holidayMultiplier || 1)}
                  onChange={(val) => setPriceConfig(prev => ({ ...prev, holidayMultiplier: Number(val) }))}
                />
                <Text className='unit-text'>倍 (如 1.2 = 加价20%)</Text>
              </View>
            </View>

            <View className='price-config-section'>
              <Text className='section-label'>指定日期价格调整</Text>
              {dateOverrides.length > 0 && (
                <View className='date-overrides-list'>
                  {dateOverrides.map((override, idx) => (
                    <View key={idx} className='override-item'>
                      <Text>{override.date}</Text>
                      <Text>×{override.multiplier}</Text>
                      <Text className='remove-btn' onClick={() => {
                        const newList = [...dateOverrides];
                        newList.splice(idx, 1);
                        setDateOverrides(newList);
                      }}>删除</Text>
                    </View>
                  ))}
                </View>
              )}
              <View className='add-override-row'>
                <Input
                  className='date-input'
                  placeholder='日期 YYYY-MM-DD'
                  value={newOverrideDate}
                  onChange={(val) => setNewOverrideDate(val)}
                />
                <Input
                  className='multiplier-input-small'
                  type='number'
                  placeholder='倍数'
                  value={String(newOverrideMultiplier)}
                  onChange={(val) => setNewOverrideMultiplier(Number(val))}
                />
                <Button size='small' onClick={() => {
                  if (!newOverrideDate) {
                    Taro.showToast({ title: '请输入日期', icon: 'none' });
                    return;
                  }
                  setDateOverrides([...dateOverrides, { date: newOverrideDate, multiplier: newOverrideMultiplier }]);
                  setNewOverrideDate('');
                }}>添加</Button>
              </View>
            </View>
          </View>
        </Form>
      </View>
    </View>
  );
};

export default HotelManage;