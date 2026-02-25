import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Rate, TextArea, Row, Col, Tag } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { HotelStatus, IHotel, IHotelRoom } from '../../../shared/types/index';
import { LocalStorage, STORAGE_KEYS } from '../../../shared/utils/LocalStorage';
import { useStore } from '../../../shared/store';
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

  // 实时监测图片值
  const imageUrlWatch = Form.useWatch('imageUrl', form);

  useEffect(() => {
    if (hotelId) {
      setIsEdit(true);
      loadHotelDetail(hotelId);
    }
  }, [hotelId]);

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
      rooms: normalizeRooms(original.rooms || []),
    };
    const next = {
      nameCn: updates.nameCn || '',
      star: Number(updates.star || 0),
      address: updates.address || '',
      imageUrl: updates.imageUrl || '',
      openingTime: updates.openingTime || '',
      nearbyIntro: updates.nearbyIntro || '',
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
      const finalData = {
        ...values,
        rooms: roomList.map(room => ({
          ...room,
          size: room.size ? `${String(room.size).replace(/㎡/g, '')}㎡` : '',
        })),
      };
      if (isEdit && hotelId) {
        if (currentStatus === HotelStatus.PUBLISHED) {
          await hotelService.createHotel({
            ...finalData,
            status: HotelStatus.PENDING,
            uploadedBy: originalHotel?.uploadedBy || user?.username || 'admin',
            sourceHotelId: hotelId,
          });
          Taro.showToast({ title: '已提交变更申请，请等待审核', icon: 'success' });
        } else {
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
        }
      } else {
        await hotelService.createHotel({
          ...finalData,
          status: HotelStatus.PENDING,
          uploadedBy: user?.username || 'admin',
        });
        Taro.showToast({ title: '已提交，请等待审核', icon: 'success' });
      }
      setTimeout(() => {
        // 保存成功后清除编辑ID，让返回时重新加载数据
        LocalStorage.remove(STORAGE_KEYS.EDIT_HOTEL_ID);
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
              <Button className='c-btn' onClick={() => Taro.navigateBack()}>取消</Button>
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
              <Input placeholder='请输入详细地理位置' />
            </Form.Item>
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
            <Form.Item label='周边简介' name='nearbyIntro'>
              <TextArea maxLength={200} placeholder='周边交通、配套、地标等（不超过200字）' />
            </Form.Item>
          </View>
        </Form>
      </View>
    </View>
  );
};

export default HotelManage;