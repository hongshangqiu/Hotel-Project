import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Rate, TextArea } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { HotelStatus } from '../../../shared/types/hotel';
import './index.scss';

const HotelManage = () => {
  const router = useRouter();
  const hotelId = router.params.id;
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (hotelId) {
      setIsEdit(true);
      loadHotelDetail(hotelId);
    }
  }, [hotelId]);

  const loadHotelDetail = async (id: string) => {
    const data = await hotelService.getHotelById(id);
    if (data) {
      form.setFieldsValue(data);
    }
  };

  const onFinish = async (values: any) => {
    Taro.showLoading({ title: '提交中...' });
    try {
      if (isEdit && hotelId) {
        await hotelService.updateHotel(hotelId, values);
        Taro.showToast({ title: '更新成功' });
      } else {
        await hotelService.createHotel({ ...values, status: HotelStatus.PENDING });
        Taro.showToast({ title: '提交成功，待审核' });
      }
      setTimeout(() => Taro.navigateBack(), 1000);
    } finally {
      Taro.hideLoading();
    }
  };

  return (
    <View className='admin-manage-page'>
      {/* 顶部装饰条 */}
      <View className='page-banner'>
        <Text className='banner-title'>{isEdit ? '编辑酒店' : '新增酒店录入'}</Text>
        <Text className='banner-desc'>请准确填写酒店信息，以便快速通过审核</Text>
      </View>

      <View className='form-card'>
        <Form
          form={form}
          onFinish={onFinish}
          footer={
            <View className='form-submit-box'>
              <Button block type='primary' nativeType='submit' className='submit-btn'>
                {isEdit ? '保存修改' : '立即发布'}
              </Button>
            </View>
          }
        >
          <View className='section-title'>基本信息</View>
          
          <Form.Item label='中文名称' name='nameCn' rules={[{ required: true, message: '必填' }]}>
            <Input placeholder='请输入酒店中文名称' />
          </Form.Item>

          <Form.Item label='英文名称' name='nameEn' rules={[{ required: true, message: '必填' }]}>
            <Input placeholder='请输入酒店英文名称' />
          </Form.Item>

          <Form.Item label='酒店星级' name='star' rules={[{ required: true, message: '必填' }]}>
            <Rate />
          </Form.Item>

          <View className='section-title'>详细属性</View>

          <Form.Item label='详细地址' name='address' rules={[{ required: true, message: '必填' }]}>
            <Input placeholder='请输入详细地理位置' />
          </Form.Item>

          <Form.Item label='主打房型' name='roomType' rules={[{ required: true, message: '必填' }]}>
            <Input placeholder='如：豪华大床房' />
          </Form.Item>

          <Form.Item label='起步价格' name='price' rules={[{ required: true, message: '必填' }]}>
            <Input type='number' placeholder='请输入每晚价格' />
          </Form.Item>

          <Form.Item label='开业时间' name='openingTime' rules={[{ required: true, message: '必填' }]}>
            <Input placeholder='格式如：2023-01' />
          </Form.Item>

          <View className='section-title'>多媒体与活动</View>

          <Form.Item label='图片URL' name='imageUrl'>
            <Input placeholder='请输入封面图线上链接' />
          </Form.Item>

          <Form.Item label='周边交通' name='attractions'>
            <TextArea placeholder='周边热门景点、交通枢纽描述' maxLength={100} showCount />
          </Form.Item>

          <Form.Item label='优惠信息' name='discountInfo'>
            <Input placeholder='如：新店限时 8 折' />
          </Form.Item>
        </Form>
      </View>
    </View>
  );
};

export default HotelManage;