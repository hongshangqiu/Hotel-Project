import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Rate, TextArea } from '@nutui/nutui-react-taro';
import { hotelService } from '../../../shared/services/hotelService';
import { HotelStatus } from '../../../shared/types/hotel';
import './index.scss';

const HotelManage = () => {
  const router = useRouter();
  const hotelId = router.params.id; // 从 URL 获取酒店 ID
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);

  // 监听图片 URL 变化，用于实时预览
  const imageUrlWatch = Form.useWatch('imageUrl', form);

  // 初始化加载：判断是编辑还是新增
  useEffect(() => {
    if (hotelId) {
      setIsEdit(true);
      loadHotelDetail(hotelId);
    }
  }, [hotelId]);

  // 获取已有酒店数据并回显
  const loadHotelDetail = async (id: string) => {
    try {
      Taro.showLoading({ title: '加载中...' });
      const data = await hotelService.getHotelById(id);
      if (data) {
        form.setFieldsValue(data); // 核心：回显数据到表单
      } else {
        Taro.showToast({ title: '未找到酒店信息', icon: 'none' });
      }
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      Taro.hideLoading();
    }
  };

  /**
   * 表单提交逻辑
   */
  const onFinish = async (values: any) => {
    Taro.showLoading({ title: '同步数据中...', mask: true });
    try {
      if (isEdit && hotelId) {
        // 编辑模式：调用更新接口
        await hotelService.updateHotel(hotelId, values);
        Taro.hideLoading();
        Taro.showToast({ title: '更新成功', icon: 'success' });
      } else {
        // 新增模式：调用创建接口，强制设置状态为“待审核”
        await hotelService.createHotel({ ...values, status: HotelStatus.PENDING });
        Taro.hideLoading();
        Taro.showToast({ title: '发布成功，请等待审核', icon: 'success' });
      }

      // 成功后延迟 1.5 秒返回列表页，给用户看提示的时间
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);

    } catch (err) {
      Taro.hideLoading();
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
      console.error('提交报错:', err);
    }
  };

  /**
   * 修复：增加校验失败的反馈
   */
  const onFinishFailed = (values: any, errors: any) => {
    if (errors && errors.length > 0) {
      Taro.showToast({
        title: `请完善: ${errors[0].message}`,
        icon: 'none'
      });
    }
  };

  return (
    <View className='admin-manage-page'>
      {/* 顶部装饰 Banner */}
      <View className='page-banner'>
        <Text className='banner-title'>{isEdit ? '编辑酒店' : '新增酒店录入'}</Text>
        <Text className='banner-desc'>请准确填写酒店信息，提交后将进入审核流程</Text>
      </View>

      <View className='form-card'>
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed} // 绑定校验失败回调
          footer={
            <View className='form-submit-box'>
              <Button block type='primary' nativeType='submit' className='submit-btn'>
                {isEdit ? '确认保存修改' : '立即提交发布'}
              </Button>
              {/* 取消按钮，提升 UX 体验 */}
              <Button 
                block 
                fill='outline' 
                className='cancel-btn' 
                onClick={() => Taro.navigateBack()}
              >
                返回不保存
              </Button>
            </View>
          }
        >
          <View className='section-title'>核心信息</View>
          
          <Form.Item label='中文名' name='nameCn' rules={[{ required: true, message: '请输入酒店中文名' }]}>
            <Input placeholder='请输入酒店中文名称' />
          </Form.Item>

          <Form.Item label='英文名' name='nameEn' rules={[{ required: true, message: '请输入酒店英文名' }]}>
            <Input placeholder='请输入酒店英文名称' />
          </Form.Item>

          <Form.Item label='酒店星级' name='star' rules={[{ required: true, message: '请选择星级' }]}>
            <Rate />
          </Form.Item>

          <View className='section-title'>位置与价格</View>

          <Form.Item label='详细地址' name='address' rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder='请输入详细地理位置' />
          </Form.Item>

          <Form.Item label='主打房型' name='roomType' rules={[{ required: true, message: '请输入房型' }]}>
            <Input placeholder='如：行政大床房' />
          </Form.Item>

          <Form.Item label='起步价格' name='price' rules={[{ required: true, message: '请输入价格' }]}>
            <Input type='number' placeholder='请输入每晚价格' />
          </Form.Item>

          <Form.Item label='开业时间' name='openingTime' rules={[{ required: true, message: '请输入开业日期' }]}>
            <Input placeholder='格式如：2023-01' />
          </Form.Item>

          <View className='section-title'>多媒体与活动</View>

          <Form.Item label='封面图URL' name='imageUrl'>
            <Input placeholder='请输入封面图片线上链接' />
          </Form.Item>

          {/* 修复：增加图片预览区域 */}
          <Form.Item label='图片预览'>
            <View style={{ width: '120px', height: '80px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
              {imageUrlWatch ? (
                <Image src={imageUrlWatch} style={{ width: '100%', height: '100%' }} mode='aspectFill' />
              ) : (
                <Text style={{ fontSize: '12px', color: '#ccc' }}>暂无图片</Text>
              )}
            </View>
          </Form.Item>

          <Form.Item label='周边交通' name='attractions'>
            <TextArea placeholder='请输入周边热门景点、交通枢纽描述' maxLength={100} showCount />
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