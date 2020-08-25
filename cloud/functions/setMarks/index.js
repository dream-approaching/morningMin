const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const marks = db.collection('marks');

const _ = db.command;
exports.main = async (event, context) => {
  const { userInfo, markDate, markTime } = event;
  console.log('%cuserInfo:', 'color: #0e93e0;background: #aaefe5;', userInfo);
  let { OPENID, UNIONID } = await cloud.getWXContext();
  console.log('%cOPENID, UNIONID:', 'color: #0e93e0;background: #aaefe5;', OPENID, UNIONID);
  let res;
  // 先查询该用户当天是否已经打过卡，判断是打卡还是修改打卡
  const filterList = await marks
    .where({
      openId: OPENID,
      markDate,
    })
    .get();
  if (!filterList.data.length) {
    const newRecordData = {
      ...userInfo,
      markDate,
      markTime,
      // rawData: userInfo.rawData,
      openId: OPENID,
      unionId: UNIONID,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    console.log('%cnewRecordData:', 'color: #0e93e0;background: #aaefe5;', newRecordData);
    res = await marks.add({
      data: newRecordData,
    });
  } else {
    const record = filterList.data[0];
    console.log('%crecord:', 'color: #0e93e0;background: #aaefe5;', record);
    const datas = {
      markDate,
      markTime,
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    console.log('%cdatas:', 'color: #0e93e0;background: #aaefe5;', datas);
    res = await users.doc(record._id).update({ data: datas });
  }

  return res;
};
