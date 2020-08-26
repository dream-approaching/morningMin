const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const marks = db.collection('marks');

const _ = db.command;
exports.main = async (event, context) => {
  const { markDate } = event;
  let { OPENID, UNIONID } = await cloud.getWXContext();
  console.log('%cOPENID, UNIONID:', 'color: #0e93e0;background: #aaefe5;', OPENID, UNIONID);
  let res;
  // 先查询该用户当天是否已经打过卡，判断是打卡还是修改打卡
  await marks
    .where({
      openId: OPENID,
      markDate,
    })
    .remove();

  return '';
};
