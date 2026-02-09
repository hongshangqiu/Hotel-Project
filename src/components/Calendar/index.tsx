import { View, Text, Button } from '@tarojs/components';
import { useState, useMemo, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useHotelStore } from '../../shared/store/useHotelStore';
import './index.scss';

const Calendar = () => {
  const { calendarVisible, setCalendarVisible, searchParams, setSearchParams, calendarMode } = useHotelStore();
  const [viewDate, setViewDate] = useState(new Date());
  
  // 这里的 pickMode 初始化受 Store 控制
  const [pickMode, setPickMode] = useState<'start' | 'end'>('start');

  // 当日历显示状态或模式变化时，强制同步内部选择模式
  useEffect(() => {
    if (calendarVisible) {
      setPickMode(calendarMode);
    }
  }, [calendarVisible, calendarMode]);

  // 获取今天零点的时间戳，用于禁用判断
  const todayTimestamp = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const res: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) res.push(null);
    for (let i = 1; i <= totalDays; i++) res.push(i);
    return res;
  }, [viewDate]);

  // Hook 必须在 return 之前
  if (!calendarVisible) return null;

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;
    const targetTime = new Date(dateStr).getTime();

    // 规则校验：不能选今天之前的日期
    if (targetTime < todayTimestamp) {
      Taro.showToast({ title: '不能选择过去的日期', icon: 'none' });
      return;
    }

    if (pickMode === 'start') {
      setSearchParams({ startDate: dateStr });
    } else {
      setSearchParams({ endDate: dateStr });
    }

    // 校验逻辑：仅提示
    const start = pickMode === 'start' ? dateStr : searchParams.startDate;
    const end = pickMode === 'end' ? dateStr : searchParams.endDate;
    if (start && end && new Date(end) < new Date(start)) {
      Taro.showToast({ title: '注意：离店早于入住', icon: 'none' });
    }

    // 选完即关闭返回主界面
    setCalendarVisible(false);
  };

  const getDayStatus = (day: number | null) => {
    if (!day) return '';
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;
    const targetTime = new Date(dateStr).getTime();

    if (targetTime < todayTimestamp) return 'disabled';

    if (pickMode === 'start') {
      if (dateStr === searchParams.startDate) return 'active-bright';
      if (dateStr === searchParams.endDate) return 'active-faded';
    } else {
      if (dateStr === searchParams.endDate) return 'active-bright';
      if (dateStr === searchParams.startDate) return 'active-faded';
    }
    return '';
  };

  return (
    <View className='calendar-overlay' onClick={() => setCalendarVisible(false)}>
      <View className='calendar-box' onClick={e => e.stopPropagation()}>
        <View className='mode-switch'>
          <View className={`mode-item ${pickMode === 'start' ? 'on' : ''}`} onClick={() => setPickMode('start')}>选入住</View>
          <View className={`mode-item ${pickMode === 'end' ? 'on' : ''}`} onClick={() => setPickMode('end')}>选离店</View>
        </View>

        <View className='month-ctrl'>
          <Text className='arrow' onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>{"<"}</Text>
          <Text className='month-text'>{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</Text>
          <Text className='arrow' onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>{">"}</Text>
        </View>

        <View className='weeks-grid'>
          {['日','一','二','三','四','五','六'].map(w => <View key={w} className='week-cell'>{w}</View>)}
        </View>

        <View className='days-grid'>
          {days.map((d, i) => (
            <View key={i} className={`day-cell ${getDayStatus(d)}`} onClick={() => handleDateClick(d)}>
              <Text className='day-text'>{d}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Calendar;