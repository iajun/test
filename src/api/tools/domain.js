/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-09-30 15:09:01
 * @LastEditTime: 2019-10-23 16:51:04
 * @LastEditors: Please set LastEditors
 */
let domain;
const host = window.location.host;
const domainList = [
  {
    regexp: /127.0.0.1/,
    domain: "http://127.0.0.1:8010"
  },
  {
    regexp: /admin\.juhe\.baishancloud\.com/,
    domain: "https://admin.juhe.baishancloud.com"
  }
];
for (let i = 0; i < domainList.length; i++) {
  const regexp = domainList[i].regexp;
  if (regexp.test(host)) {
    domain = domainList[i].domain;
    break;
  }
}

if (!domain) {
  domain = "http://127.0.0.1:8010";
}

export default domain;
