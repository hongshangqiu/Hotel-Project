import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useMemo } from 'react';
import { useHotelStore } from '../../shared/store/useHotelStore';
import './index.scss';

const Calendar = () => {
  const { calendarVisible, setCalendarVisible, searchParams, setSearchParams } = useHotelStore();
  
  // 临时存储选中的日期数组（最多2个）
  const [tempDates, setTempDates] = useState<string[]>([]);

  // 1. 生成未来 6 个月的日历数据
  const calendarData = useMemo(() => {
    const months: any[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    for (let i = 0; i < 6; i++) {
      const monthFirstDay = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const y = monthFirstDay.getFullYear();
      const m = monthFirstDay.getMonth() + 1;
      const totalDays = new Date(y, m, 0).getDate();
      const startWeekDay = monthFirstDay.getDay();

      const days: (number | null)[] = [];
      for (let j = 0; j < startWeekDay; j++) days.push(null);
      for (let j = 1; j <= totalDays; j++) days.push(j);
      
      months.push({ year: y, month: m, days });
    }
    return { months, tStr };
  }, []);

  if (!calendarVisible) return null;

  // 2. 核心点击逻辑
  const handleDayClick = (y: number, m: number, d: number | null) => {
    if (!d) return;
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const todayTs = new Date(calendarData.tStr).getTime();
    const targetTs = new Date(dateStr).getTime();

    if (targetTs < todayTs) return; // 虚化日期禁点

    if (tempDates.length === 0 || tempDates.length === 2) {
      // 第一次点击 或 已经选满两个后再点第三个：重新开始
      setTempDates([dateStr]);
    } else {
      // 第二次点击
      if (dateStr === tempDates[0]) return; // 入离同日不响应

      const sorted = [...tempDates, dateStr].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      setTempDates(sorted);
      
      // 同步到 Store 并自动关闭
      setTimeout(() => {
        setSearchParams({ startDate: sorted[0], endDate: sorted[1] });
        setCalendarVisible(false);
        setTempDates([]); // 重置内部状态供下次打开使用
      }, 500);
    }
  };

  // 3. 获取日期状态样式
  const getDayStatus = (y: number, m: number, d: number | null) => {
    if (!d) return { cls: 'empty', label: '' };
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const ts = new Date(dateStr).getTime();
    const todayTs = new Date(calendarData.tStr).getTime();

    if (ts < todayTs) return { cls: 'disabled', label: '' };
    
    // 如果还没点过，今天显示“今天”字样
    if (dateStr === calendarData.tStr && tempDates.length === 0) return { cls: 'today', label: '今天' };

    if (tempDates.length === 1 && dateStr === tempDates[0]) return { cls: 'selected single', label: '入住' };
    
    if (tempDates.length === 2) {
      if (dateStr === tempDates[0]) return { cls: 'selected start', label: '入住' };
      if (dateStr === tempDates[1]) return { cls: 'selected end', label: '离店' };
      if (ts > new Date(tempDates[0]).getTime() && ts < new Date(tempDates[1]).getTime()) return { cls: 'in-range', label: '' };
    }
    return { cls: '', label: '' };
  };

  return (
    <View className='cal-v5-root'>
      <View className='cal-v5-mask' onClick={() => setCalendarVisible(false)} />
      <View className='cal-v5-content'>
        <View className='cal-v5-header'>
          <Text className='close-btn' onClick={() => setCalendarVisible(false)}>×</Text>
          <Text className='title'>请选择入住离店日期</Text>
        </View>

        <View className='cal-v5-weeks'>
          {['日','一','二','三','四','五','六'].map(w => <Text key={w} className='week-item'>{w}</Text>)}
        </View>

        <ScrollView scrollY className='cal-v5-scroll'>
          {calendarData.months.map(m => (
            <View key={`${m.year}-${m.month}`} className='m-section'>
              <View className='m-title'>{m.year}年{m.month.toString().padStart(2, '0')}月</View>
              <View className='d-grid'>
                {m.days.map((day: any, i: number) => {
                  const { cls, label } = getDayStatus(m.year, m.month, day);
                  return (
                    <View 
                      key={i} 
                      className={`d-cell ${cls}`} 
                      onClick={() => handleDayClick(m.year, m.month, day)}
                    >
                      <Text className='d-num'>{day}</Text>
                      {label && <Text className='d-label'>{label}</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Calendar;