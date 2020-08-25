const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const users = db.collection('users');

const _ = db.command;
exports.main = async (event, context) => {
  const { userInfo, updateObj } = event;
  console.log('%cuserInfo:', 'color: #0e93e0;background: #aaefe5;', userInfo);
  let { OPENID, UNIONID } = await cloud.getWXContext();
  console.log('%cOPENID, UNIONID:', 'color: #0e93e0;background: #aaefe5;', OPENID, UNIONID);
  // 先查询用户是否存在
  const filterList = await users
    .where({
      openId: OPENID,
    })
    .get();
  console.log('%cfilterList:', 'color: #0e93e0;background: #aaefe5;', filterList);
  let res;
  if (!filterList.data.length) {
    const newRecordData = {
      ...userInfo,
      openId: OPENID,
      unionId: UNIONID,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      lastLogin: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ...updateObj,
    };
    console.log('%cnewRecordData:', 'color: #0e93e0;background: #aaefe5;', newRecordData);
    res = await users.add({
      data: newRecordData,
    });
  } else {
    const record = filterList.data[0];
    console.log('%crecord:', 'color: #0e93e0;background: #aaefe5;', record);
    const datas = {
      ...updateObj,
      updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    console.log('%cdatas:', 'color: #0e93e0;background: #aaefe5;', datas);
    res = await users.doc(record._id).update({ data: datas });
  }
  return res;
};
