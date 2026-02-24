import { View } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useMemo } from 'react';

const WebviewPage = () => {
  const router = useRouter();
  const url = useMemo(() => {
    const raw = router.params.url || '';
    return decodeURIComponent(String(raw));
  }, [router.params.url]);

  if (!url) {
    return <View>缺少跳转地址</View>;
  }

  return <Taro.WebView src={url} />;
};

export default WebviewPage;
