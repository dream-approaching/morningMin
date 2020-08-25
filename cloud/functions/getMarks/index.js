const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
const marks = db.collection('marks');
const MAX_LIMIT = 100;

exports.main = async (event, context) => {
  let { OPENID } = await cloud.getWXContext();
  console.log('%cOPENID:', 'color: #0e93e0;background: #aaefe5;', OPENID);
  const countResult = await marks.count();
  console.log('%ccountResult:', 'color: #0e93e0;background: #aaefe5;', countResult);
  const total = countResult.total;
  console.log('%ctotal:', 'color: #0e93e0;background: #aaefe5;', total);
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100);
  if (batchTimes === 0) {
    return {
      data: [],
      errMsg: '暂无数据',
      total,
    };
  }
  console.log('%cbatchTimes:', 'color: #0e93e0;background: #aaefe5;', batchTimes);
  // 承载所有读操作的 promise 的数组
  const markList = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = marks
      .where({
        openId: OPENID,
      })
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get();
    markList.push(promise);
  }
  // 等待所有
  return (await Promise.all(markList)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
      total,
    };
  });
};
