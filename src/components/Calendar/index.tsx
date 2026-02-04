import { View, Text, Button } from '@tarojs/components';
import { useHotelStore } from '../../shared/store/useHotelStore';
import './index.scss';

const Calendar = () => {
  const { calendarVisible, setCalendarVisible, setSearchParams } = useHotelStore();
  if (!calendarVisible) return null;

  const onSelect = (type: 'today' | 'tomorrow') => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setSearchParams(type === 'today' ? { startDate: today } : { startDate: tomorrow });
    setCalendarVisible(false);
  };

  return (
    <View className='calendar-mask' onClick={() => setCalendarVisible(false)}>
      <View className='calendar-body' onClick={e => e.stopPropagation()}>
        <Text className='title'>选择日期</Text>
        <Button onClick={() => onSelect('today')}>今天</Button>
        <Button onClick={() => onSelect('tomorrow')}>明天</Button>
      </View>
    </View>
  );
};
export default Calendar;