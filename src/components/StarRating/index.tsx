import { View, Text } from '@tarojs/components';
import './index.scss';

interface StarRatingProps {
  maxStars?: number;
  rating: number;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({
  maxStars = 5,
  rating,
  size = 'medium'
}) => {
  // 生成星星数组 [1, 2, 3, 4, 5]
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View className={`star-rating ${size}`}>
      {stars.map((star) => (
        <Text
          key={star}
          className={`star ${star <= rating ? 'active' : ''}`}
        >
          ★
        </Text>
      ))}
    </View>
  );
};

export default StarRating;
