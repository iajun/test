// 下载
export const export_xls = (data, filename) => {
    let name = filename || 'download.xls';
    let href;
    let _utf = "\uFEFF";
    let export_data = data.join('\r\n');
    if (window.Blob && window.URL && window.URL.createObjectURL) {
        let xlsData = new Blob([_utf + export_data], {
            type: 'application/vnd.ms-excel'
        });
        href = URL.createObjectURL(xlsData);
    }else {
        href = 'data:attachment/xls;charset=utf-8,' + _utf + encodeURIComponent(export_data); //容易受url长度限制
    }
    let link = document.createElement('a');
    link.setAttribute('href', href);
    link.setAttribute('download', name);
    link.click();
};
