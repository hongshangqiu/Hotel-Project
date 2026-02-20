import { useEffect, useMemo, useState } from 'react'
import { View, Text, Input, Button, Picker, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import Calendar from '../../../components/Calendar'
import { useHotelStore } from '../../../shared/store/useHotelStore'
import { hotelService } from '../../../shared/services/hotelService'
import { IHotel } from '../../../shared/types/hotel'

import './index.scss'

function parseDate(s: string) {
    const [y, m, d] = s.split('-').map((x) => Number(x))
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
}

function diffDays(start: string, end: string) {
    const a = parseDate(start).getTime()
    const b = parseDate(end).getTime()
    const day = 24 * 60 * 60 * 1000
    return Math.floor((b - a) / day)
}

function isValidPhone(phone: string) {
    return /^\d{11}$/.test(phone)
}

const Booking = () => {
    const { searchParams, setCalendarVisible } = useHotelStore()

    const [hotel, setHotel] = useState<IHotel | null>(null)
    const [loading, setLoading] = useState(false)

    const [roomCount, setRoomCount] = useState(1)
    const [guestName, setGuestName] = useState('')
    const [phone, setPhone] = useState('')

    // 房型选择
    const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)

    const hotelId = useMemo(() => {
        const id = Taro.getCurrentInstance().router?.params?.id
        return typeof id === 'string' ? id : ''
    }, [])

    const roomIdFromQuery = useMemo(() => {
        const roomId = Taro.getCurrentInstance().router?.params?.roomId
        return typeof roomId === 'string' ? roomId : ''
    }, [])

    const handleBack = () => {
        const pages = Taro.getCurrentPages();
        if (pages.length > 1) {
            Taro.navigateBack();
            return;
        }
        // 没有上一页时回到列表页
        Taro.navigateTo({ url: '/pages/user/list/index' });
    };

    useEffect(() => {
        if (!hotelId) {
            Taro.showToast({ title: '缺少酒店ID', icon: 'none' })
            return
        }

        setLoading(true)
        hotelService
            .getHotelById(hotelId)
            .then((data) => {
                setHotel(data)
                setSelectedRoomIndex(0)
            })
            .catch(() => Taro.showToast({ title: '获取酒店信息失败', icon: 'none' }))
            .finally(() => setLoading(false))
    }, [hotelId])

    useEffect(() => {
        if (!hotel || !roomIdFromQuery) return

        const rooms = hotel.rooms || []
        const idx = rooms.findIndex((r) => r.id === roomIdFromQuery)

        if (idx >= 0) {
            setSelectedRoomIndex(idx)
        }
    }, [hotel, roomIdFromQuery])

    const startDate = searchParams.startDate
    const endDate = searchParams.endDate

    const nights = useMemo(() => {
        const d = diffDays(startDate, endDate)
        return d > 0 ? d : 0
    }, [startDate, endDate])

    const selectedRoom = useMemo(() => {
        const rooms = hotel?.rooms || []
        if (rooms.length === 0) return null
        const idx = Math.min(Math.max(selectedRoomIndex, 0), rooms.length - 1)
        return rooms[idx]
    }, [hotel, selectedRoomIndex])

    // 单价：优先房型价（如果有 rooms），否则用 hotel.price
    const unitPrice = useMemo(() => {
        if (selectedRoom && Number.isFinite(Number(selectedRoom.price))) {
            return Number(selectedRoom.price)
        }
        return hotel ? Number(hotel.price) : 0
    }, [hotel, selectedRoom])

    const totalPrice = useMemo(() => {
        if (!unitPrice || !nights) return 0
        return unitPrice * nights * roomCount
    }, [unitPrice, nights, roomCount])

    const decRoom = () => setRoomCount((x) => (x > 1 ? x - 1 : 1))
    const incRoom = () => setRoomCount((x) => (x < 10 ? x + 1 : 10))

    const openCalendar = () => {
        // 你的 store 支持 mode，但你 Calendar 目前是一次选两个日期并自动写回
        setCalendarVisible(true)
    }

    const submit = async () => {
        if (loading) return
        if (!hotel) {
            Taro.showToast({ title: '酒店信息未加载完成', icon: 'none' })
            return
        }
        if (!startDate || !endDate || nights <= 0) {
            Taro.showToast({ title: '请选择有效的入住离店日期', icon: 'none' })
            return
        }
        if (!guestName.trim()) {
            Taro.showToast({ title: '请填写入住人姓名', icon: 'none' })
            return
        }
        if (!phone.trim()) {
            Taro.showToast({ title: '请填写手机号', icon: 'none' })
            return
        }
        if (!isValidPhone(phone.trim())) {
            Taro.showToast({ title: '手机号格式不正确', icon: 'none' })
            return
        }

        const hotelName = hotel.nameCn || hotel.nameEn || '未命名酒店'
        const roomName = selectedRoom?.name ? `\n房型：${selectedRoom.name}` : ''

        const res = await Taro.showModal({
            title: '预定成功',
            content:
                `酒店：${hotelName}` +
                `${roomName}\n` +
                `入住：${startDate}\n` +
                `离店：${endDate}\n` +
                `晚数：${nights} 晚\n` +
                `房间：${roomCount} 间\n` +
                `总价：¥${totalPrice.toFixed(2)}`,
            confirmText: '完成',
            cancelText: '继续浏览',
        })

        if (res.confirm) {
            Taro.navigateBack()
        }
    }

    const roomOptions = useMemo(() => {
        const rooms = hotel?.rooms || []
        return rooms.map((r) => `${r.name}  ¥${r.price}/晚`)
    }, [hotel])

    return (
        <View className='booking-page'>
            <View className='header'>
                <Text className='header-title'>预定信息</Text>
            </View>

            <View className='card'>
                <View className='hotel-block'>
                    <Text className='hotel-name'>
                        {hotel ? (hotel.nameCn || hotel.nameEn) : loading ? '加载中...' : '未命名酒店'}
                    </Text>
                    <Text className='hotel-sub'>
                        {unitPrice > 0 ? `¥${unitPrice.toFixed(0)} / 晚` : '价格待定'}
                    </Text>
                </View>
            </View>

            {/* 房型（可选） */}
            {hotel?.rooms && hotel.rooms.length > 0 && (
                <View className='card'>
                    <Text className='card-title'>房型</Text>

                    <Picker
                        mode='selector'
                        range={roomOptions}
                        value={selectedRoomIndex}
                        onChange={(e) => setSelectedRoomIndex(Number(e.detail.value))}
                    >
                        <View className='row clickable'>
                            <Text className='label'>选择房型</Text>
                            <View className='picker'>
                                <Text className='picker-text'>
                                    {roomOptions[selectedRoomIndex] || '请选择'}
                                </Text>
                                <Text className='picker-arrow'>›</Text>
                            </View>
                        </View>
                    </Picker>

                    {selectedRoom?.imageUrl && (
                        <View className='room-preview'>
                            <Image className='room-img' mode='aspectFill' src={selectedRoom.imageUrl} />
                            <View className='room-meta'>
                                <Text className='room-meta-line'>{selectedRoom.size} · {selectedRoom.bedType}</Text>
                                <Text className='room-meta-line'>{selectedRoom.policy}</Text>
                            </View>
                        </View>
                    )}
                </View>
            )}

            <View className='card'>
                <Text className='card-title'>日期</Text>

                <View className='row clickable' onClick={openCalendar}>
                    <Text className='label'>入住/离店</Text>
                    <View className='picker'>
                        <Text className='picker-text'>
                            {startDate && endDate ? `${startDate} - ${endDate}` : '请选择日期'}
                        </Text>
                        <Text className='picker-arrow'>›</Text>
                    </View>
                </View>

                <View className='row'>
                    <Text className='label'>晚数</Text>
                    <Text className='value'>{nights > 0 ? `${nights} 晚` : '-'}</Text>
                </View>
            </View>

            <View className='card'>
                <Text className='card-title'>房间</Text>

                <View className='row'>
                    <Text className='label'>数量</Text>
                    <View className='stepper'>
                        <View className={`stepper-btn ${roomCount <= 1 ? 'disabled' : ''}`} onClick={decRoom}>
                            <Text className='stepper-btn-text'>-</Text>
                        </View>
                        <View className='stepper-mid'>
                            <Text className='stepper-mid-text'>{roomCount}</Text>
                        </View>
                        <View className={`stepper-btn ${roomCount >= 10 ? 'disabled' : ''}`} onClick={incRoom}>
                            <Text className='stepper-btn-text'>+</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className='card'>
                <Text className='card-title'>入住人信息</Text>

                <View className='row'>
                    <Text className='label'>姓名</Text>
                    <Input
                        className='input'
                        value={guestName}
                        onInput={(e) => setGuestName(e.detail.value)}
                        placeholder='请输入入住人姓名'
                        placeholderClass='placeholder'
                    />
                </View>

                <View className='row'>
                    <Text className='label'>手机号</Text>
                    <Input
                        className='input'
                        value={phone}
                        type='number'
                        maxlength={11}
                        onInput={(e) => setPhone(e.detail.value)}
                        placeholder='请输入11位手机号'
                        placeholderClass='placeholder'
                    />
                </View>
            </View>

            <View className='footer'>
                <View className='price'>
                    <Text className='price-label'>总价</Text>
                    <Text className='price-value'>¥{totalPrice.toFixed(2)}</Text>
                </View>

                <Button className='submit-btn' loading={loading} onClick={submit}>
                    提交预定
                </Button>
            </View>

            {/* 关键：挂载日历组件 */}
            <Calendar />

            <View className='back-btn' onClick={handleBack}>返回</View>
        </View>
    )
}

export default Booking