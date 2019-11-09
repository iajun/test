import 'regenerator-runtime/runtime';
// 整数千位符
export const int_thousand = (num) => {
  num += '';
  if (num.length > 3) {
    return `${int_thousand(num.slice(0, -3))  },${  num.slice(-3)}`;
  } else {
    return num;
  }
};
// 小数千位符
export const de_thousand = (num) => {
  return num && num
    .toString()
    .replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
      return `${$1  },`;
    });
};
// 日期周格式化
export function formatDig(num) {
  return num > 9 ? `${  num}` : `0${  num}`;
}
export function formatDate(mill) {
  const y = new Date(mill);
  const raws = [
    y.getFullYear(),
    formatDig(y.getMonth() + 1),
    formatDig(y.getDate()),
  ];
  const format = ['-', '-'];
  return String.raw({ raw: raws }, ...format);
}
export function* formatWeeks(year) {
  const ONE_DAY = 24 * 3600 * 1000;
  let start = new Date(year, 0, 1),
    end = new Date(year, 11, 31);
  let firstDay = start.getDay() || 7,
    lastDay = end.getDay() || 7;
  let startTime = +start,
    endTime = startTime + (7 - firstDay) * ONE_DAY,
    _endTime = end - (7 - lastDay) * ONE_DAY;
  yield [startTime, endTime];
  startTime = endTime + ONE_DAY;
  endTime = endTime + 7 * ONE_DAY;
  while (endTime < _endTime) {
    yield [startTime, endTime];
    startTime = endTime + ONE_DAY;
    endTime = endTime + 7 * ONE_DAY;
  }
  yield [startTime, +end];
}
// var date = new Date();
// var time = date.getTime();
// var year = date.getFullYear();
// let index=1;
// for(let i of formatWeeks(year)){
//     let start=i[0],end=i[1];
//     if (end < date) {
//      console.log(`${formatDate(start)} ${formatDate(end)}`);
//     }
// }
// KB,MB,GB
export const formatM = (K) => {
  if (K < 1024) {
    return K = `${K  } KB`;
  } else {
    K = eval(K / 1024);
    if (K < 1024) {
      return K = `${K.toFixed(0)  } MB`;
    } else {
      return K = `${eval(K / 1024).toFixed(0)  } GB`;
    }
  }
};
