import { View, Text, Button } from '@tarojs/components';
import { useState, useMemo } from 'react';
import { useHotelStore } from '../../shared/store/useHotelStore';
import './index.scss';

const Calendar = () => {
  const { calendarVisible, setCalendarVisible, setSearchParams } = useHotelStore();
  const [currentDate] = useState(new Date());
  
  // 内部状态：记录当前选中的日期字符串数组（最多2个）
  const [tempDates, setTempDates] = useState<string[]>([]);

  // 生成日历网格数据
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const res: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) res.push(null);
    for (let i = 1; i <= totalDays; i++) res.push(i);
    return res;
  }, [currentDate]);

  if (!calendarVisible) return null;

  // 处理日期点击
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;

    if (tempDates.includes(dateStr)) {
      // 1. 如果已选中，则取消选中（反选）
      setTempDates(tempDates.filter(d => d !== dateStr));
    } else {
      // 2. 如果未选中
      if (tempDates.length < 2) {
        // 没满2个，直接加
        setTempDates([...tempDates, dateStr]);
      } else {
        // 已满2个，再点第3个，则重置为只选当前这一个
        setTempDates([dateStr]);
      }
    }
  };

  // 确认选择
  const handleConfirm = () => {
    if (tempDates.length === 0) {
      setCalendarVisible(false);
      return;
    }

    // 排序，确保起始日期在前
    const sorted = [...tempDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (sorted.length === 1) {
      // 如果只选了一个，起止相同
      setSearchParams({ startDate: sorted[0], endDate: sorted[0] });
    } else {
      // 如果选了两个
      setSearchParams({ startDate: sorted[0], endDate: sorted[1] });
    }
    setCalendarVisible(false);
  };

  // 判断样式
  const getDayClass = (day: number | null) => {
    if (!day) return '';
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;

    if (tempDates.includes(dateStr)) return 'selected';

    // 如果选了两个，给中间的日期加个浅色背景（区间感）
    if (tempDates.length === 2) {
      const sorted = [...tempDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      const time = new Date(dateStr).getTime();
      if (time > new Date(sorted[0]).getTime() && time < new Date(sorted[1]).getTime()) {
        return 'in-range';
      }
    }
    return '';
  };

  return (
    <View className='calendar-drawer' onClick={() => setCalendarVisible(false)}>
      <View className='calendar-main' onClick={e => e.stopPropagation()}>
        <View className='header'>
          <Text className='month-title'>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</Text>
          <Text className='tip'>已选择 {tempDates.length} 个日期</Text>
        </View>

        <View className='week-bar'>
          {['日', '一', '二', '三', '四', '五', '六'].map(w => <Text key={w}>{w}</Text>)}
        </View>

        <View className='days-grid'>
          {days.map((day, index) => (
            <View 
              key={index} 
              className={`day-cell ${getDayClass(day)}`} 
              onClick={() => handleDayClick(day)}
            >
              <Text>{day || ''}</Text>
              {tempDates[0] === `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day?.toString().padStart(2, '0')}` && tempDates.length === 2 && (
                 <Text className='sub-tip'>起</Text>
              )}
            </View>
          ))}
        </View>
        
        <View className='footer-btns'>
          <Button className='cancel' onClick={() => setCalendarVisible(false)}>取消</Button>
          <Button className='confirm' onClick={handleConfirm}>确定</Button>
        </View>
      </View>
    </View>
  );
};

export default Calendar;