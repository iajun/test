/*
 * @Author: Sharp
 * @LastEditors: Sharp
 * @LastEditTime: 2019-09-30 14:29:33
 */
export const secFormat = sec => {
  let format = "";
  if (typeof sec !== "number") {
    return "-";
  }
  if (sec < 0) {
    format = "0";
  } else if (sec < 60) {
    format = `${sec} s`;
  } else if (sec < 60 * 60) {
    format = `${Math.floor(sec / 60)} m`;
  } else if (sec < 60 * 60 * 24) {
    format = `${Math.floor(sec / 3600)} h ${Math.floor((sec % 3600) / 60)} m`;
  } else {
    format = `${Math.floor(sec / (60 * 60 * 24))} d`;
  }
  return format;
};

export const openURL = (url, target) => {
  const linkTag = document.createElement('a');
  linkTag.setAttribute('href', url);
  linkTag.setAttribute('target', target);
  linkTag.click();
};
