import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import {
  AtCalendar,
  AtButton,
  AtMessage,
  AtList,
  AtListItem,
  AtIcon,
  AtFloatLayout
} from 'taro-ui';
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
    Taro.showNavigationBarLoading();
    try {
      const res = await Taro.cloud.callFunction({
        name: 'getMarks'
      });
      console.log('%cres:', 'color: #0e93e0;background: #aaefe5;', res);
      setMarkList(res.result.data);
      setMarkTotal(res.result.total);
      Taro.hideNavigationBarLoading();
    } catch (error) {
      Taro.hideNavigationBarLoading();
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

  const [marks, setMarks] = useState([]);
  const [marksObj, setMarksObj] = useState({});
  useEffect(() => {
    console.log('useEffect setMarks');
    const marksObjBackup = {};
    const marksBackup = markList.map(item => {
      marksObjBackup[item.markDate] = item;
      return { value: item.markDate };
    });
    setMarks(marksBackup);
    setMarksObj(marksObjBackup);
  }, [markList]);

  const [selectDayData, setselectDayData] = useState({});
  useEffect(() => {
    setselectDayData(marksObj[selectDay]);
  }, [marksObj, selectDay]);

  const [btnText, setBtnText] = useState('打卡');
  useEffect(() => {
    setBtnText(marksObj[selectDay] ? `已打卡 ${marksObj[selectDay].markTime}` : '打卡');
  }, [marksObj, selectDay]);

  // 计算连续打卡天数
  const [continueDay, setContinueDay] = useState(0);
  useEffect(() => {
    console.log('useEffect 计算连续打卡天数');
    // 判断今天是否已经打卡
    const isTodayMark = marksObj[dayjs().format('YYYY-MM-DD')];
    let number = 0;
    marks.map(item => {
      console.log('%cnumber:', 'color: #0e93e0;background: #aaefe5;', number);
      console.log('%citem:', 'color: #0e93e0;background: #aaefe5;', item);
      if (
        dayjs()
          .subtract((isTodayMark ? 0 : 1) + number, 'day')
          .format('YYYY-MM-DD') === item.value
      ) {
        number = number + 1;
      }
    });
    setContinueDay(number);
  }, [marks, marksObj]);

  const handleCancelMark = async () => {
    const authSettings = await Taro.getSetting();
    if (authSettings.authSetting['scope.userInfo']) {
      try {
        setIsmarking(true);
        await Taro.cloud.callFunction({
          name: 'cancelMarks',
          data: { markDate: selectDay }
        });
        setIsmarking(false);
        toastFn('取消打卡成功');
        queryMarkList(); // 重新查询打卡记录
      } catch (error) {
        toastFn('操作失败', 'error');
        setIsmarking(false);
        console.log('%c cancelMarks error :', 'color: #0e93e0;background: #aaefe5;', error);
      }
    }
  };

  console.log('markList', markList);

  const [layoutOpen, setLayoutOpen] = useState(false);
  const handleClickInfo = () => {
    // Taro.showToast({
    //   title: '全靠自觉，并未做打卡时间限制',
    //   duration: 300000,
    //   icon: 'none'
    // });
    setLayoutOpen(true);
  };

  return (
    <View className='index'>
      <AtMessage />
      <AtCalendar onDayClick={handleClickDayClick} marks={marks} />
      <AtButton
        size='small'
        openType='getUserInfo'
        onGetUserInfo={authorityCallback}
        loading={ismarking}
        // onClick={handleDownload}
        className='btn'
        disabled={!!selectDayData}
        type='secondary'
      >
        {btnText}
      </AtButton>
      <AtButton
        size='small'
        loading={ismarking}
        onClick={handleCancelMark}
        className='btn cancelBtn'
        disabled={!selectDayData}
        type='secondary'
      >
        取消打卡 用于开发测试
      </AtButton>
      <View className='staticTitle'>
        <Text className='text'>数据统计</Text>
        <View onClick={handleClickInfo} className='iconCon'>
          <AtIcon value='help' size='18' color='#666'></AtIcon>
        </View>
      </View>
      <AtList hasBorder={false} className='listCon'>
        <AtListItem
          className='totoalItem'
          iconInfo={{ size: 15, color: '#f1ac00', value: 'star-2' }}
          title='总坚持天数'
          extraText={`${markTotal} 天`}
        />
        <AtListItem
          className='lianxuItem'
          iconInfo={{ size: 15, color: '#ff5800', value: 'heart-2' }}
          title='连续坚持天数'
          extraText={`${continueDay} 天`}
        />
      </AtList>
      <AtFloatLayout isOpened={layoutOpen} title='说明' onClose={() => setLayoutOpen(false)}>
        最简易的早起打卡，仅用于记录早起的天数，早起靠自觉，打卡也靠自觉，并未做打卡时间限制
      </AtFloatLayout>
      {/* <View className='infoTip'>
        <Text className='text'>最简易的早起打卡，仅用于记录早起的天数</Text>
        <Text className='text'>早起靠自觉，打卡也靠自觉，并未做打卡时间限制</Text>
      </View> */}
    </View>
  );
}

Index.config = {
  navigationBarTitleText: '早起打卡'
};
