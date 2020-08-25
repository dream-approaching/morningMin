import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import { AtCalendar, AtButton, AtMessage, AtList, AtListItem } from 'taro-ui';
import './index.less';

export default function Index() {
  // type: success error
  const toastFn = (text, type = 'success') => {
    Taro.atMessage({
      message: text,
      type
    });
  };
  // 授权回调
  const authorityCallback = async data => {
    console.log('%cdata:', 'color: #0e93e0;background: #aaefe5;', data);
    if (data.detail.userInfo) {
      handleMark();
    }
  };

  const [markList, setMarkList] = useState([]);
  const [markTotal, setMarkTotal] = useState(0);
  // 获取打卡列表
  const queryMarkList = async () => {
    const authSettings = await Taro.getSetting();
    if (!authSettings.authSetting['scope.userInfo']) {
      return;
    }
    try {
      const res = await Taro.cloud.callFunction({
        name: 'getMarks'
      });
      console.log('%cres:', 'color: #0e93e0;background: #aaefe5;', res);
      setMarkList(res.result.data);
      setMarkTotal(res.result.total);
    } catch (error) {
      console.log('%c queryMarkList error:', 'color: #0e93e0;background: #aaefe5;', error);
    }
  };

  const [ismarking, setIsmarking] = useState(false);
  const [selectDay, setSelectDay] = useState(dayjs().format('YYYY-MM-DD'));
  const handleClickDayClick = ({ value }) => {
    setSelectDay(value);
  };
  const handleMark = async () => {
    const authSettings = await Taro.getSetting();
    if (authSettings.authSetting['scope.userInfo']) {
      const { userInfo } = await Taro.getUserInfo();
      try {
        setIsmarking(true);
        await Taro.cloud.callFunction({
          name: 'setMarks',
          data: { userInfo, markDate: selectDay, markTime: dayjs().format('HH:mm') }
        });
        setIsmarking(false);
        toastFn('打卡成功');
        queryMarkList(); // 重新查询打卡记录
      } catch (error) {
        toastFn('操作失败', 'error');
        setIsmarking(false);
        console.log('%c setMarks error :', 'color: #0e93e0;background: #aaefe5;', error);
      }
    }
  };

  useEffect(() => {
    queryMarkList();
  }, []);

  console.log('markList', markList);
  return (
    <View className='index'>
      <AtMessage />
      <AtCalendar
        onDayClick={handleClickDayClick}
        marks={[{ value: '2020/08/01' }, { value: '2020/08/05' }]}
      />
      <AtButton
        size='small'
        openType='getUserInfo'
        onGetUserInfo={authorityCallback}
        loading={ismarking}
        // onClick={handleDownload}
        className='btn'
        type='secondary'
      >
        打卡
      </AtButton>
      <View className='staticTitle'>
        <Text className='text'>数据统计</Text>
      </View>

      <AtList className='listCon'>
        <AtListItem
          className='totoalItem'
          iconInfo={{ size: 15, color: '#f1ac00', value: 'star-2' }}
          title='总坚持天数'
          extraText='100 天'
        />
        <AtListItem
          className='lianxuItem'
          iconInfo={{ size: 15, color: '#ff5800', value: 'heart-2' }}
          title='连续坚持天数'
          extraText='100 天'
        />
      </AtList>
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '早起打卡'
};
