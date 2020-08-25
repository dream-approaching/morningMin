import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtCalendar } from 'taro-ui';
import './index.less';

import Login from '../../components/login/index';

export default function Index() {
  return (
    <View className='index'>
      <Login />
      <AtCalendar marks={[{ value: '2018/11/11' }]} />
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '首页'
};
