"use strict";
$(window).on('load', function () {
    chrome.runtime.sendMessage({ type: 'hasreport' }, function (response) {
        if (response.has == true) {
            runReportAlert();
        }
    });
});
function getDomainUrl() {
    var _a;
    var url = location.href;
    var regex = new RegExp('(.*?)/webclass/.*');
    var domainurl = (_a = url.match(regex)) === null || _a === void 0 ? void 0 : _a[1];
    return domainurl;
}
function getMailUrl() {
    return getDomainUrl() + '/webclass/msg_editor.php?msgappmode=inbox';
}
//$('tbody a').attr('href')
function runReportAlert() {
    // Create mail frame
    $('body').append('<iframe class="extmail" style="visibility:hidden;width:0;height:0;border:none;" ' +
        'src="' + getMailUrl() + '"></iframe>');
    var onetime = true;
    $('.extmail').on('load', function () {
        // limit load event's run times
        if (onetime == false) {
            $('.extmail').remove();
            $('.extmail').off();
            embedReport();
            return;
        }
        onetime = false;
        var mailframe = $('.extmail').contents();
        // Check Content
        var result = checkMainContents();
        if (result == false) {
            $('.extmail').remove();
            $('.extmail').off();
            alert('レポートがうまく提出されていないようです．');
            return;
        }
        mailframe.find('input[name="id[0]"]').trigger("click");
        mailframe.find('input[name="UNSET_UNREADFLAG"]').trigger("click");
    });
}
function checkMainContents() {
    var mailframe = $('.extmail').contents();
    var count = 0;
    var title = '';
    var datetime = '';
    mailframe.find('#MsgListTable td[nowrap]').slice(2, 5).each(function (_, htmlelem) {
        var contents = $('span', htmlelem).text();
        if (count == 0)
            title = contents;
        else if (count == 2)
            datetime = contents;
        count++;
    });
    // Check title
    if (title.match(/レポートを受け取りました/) == null)
        return false;
    // Check time
    var date = Date.parse('20' + datetime + ':00'); // While datetime's format is '20/10/12 09:30'
    if ((Date.now() - date) / (1000 * 60) > 2)
        return false;
    return true;
}
function changeUnreadPop() {
    var value = $('#js-unread-message-count').text();
    var count = parseInt(value) - 1;
    if (count <= 0)
        value = "";
    else
        value = count.toString();
    $('#js-unread-message-count').text(value);
}
function embedReport() {
    changeUnreadPop();
    $('#top-info').empty();
    getReportUrl().then(function (resolve) {
        var rtuple = resolve;
        var fileurl = rtuple[0];
        var filename = rtuple[1];
        $('#top-info').append('<div class="container"><div class="alert alert-info">' +
            '<p>レポートがうまく提出できたようです．提出したレポートのファイル名は：<b>' + filename + '</b>です．</p>' +
            '<p>ファイルを<input type="button" id="downloadbtn" value="ダウンロード" class="btn btn-default" ' +
            'onclick="location.href=\'' + fileurl + '\'">し，内容を確認できます．</p></div></div>');
    });
}
function getReportUrl() {
    return new Promise(function (resolve) {
        var _a;
        var regex = new RegExp('(.*?/webclass/course.php/.*?/).*');
        var reportpageurl = ((_a = location.href.match(regex)) === null || _a === void 0 ? void 0 : _a[1]) + 'my-reports';
        $('body').append('<iframe class="extrepo" style="visibility:hidden;width:0;height:0;border:none;" ' +
            'src="' + reportpageurl + '"></iframe>');
        $('.extrepo').on('load', function () {
            var reportframe = $('.extrepo').contents();
            var fileurl = reportframe.find('tbody a').attr('href');
            var filename = reportframe.find('tbody a[href="' + fileurl + '"]').text();
            $('.extrepo').remove();
            $('.extrepo').off();
            var domain = getDomainUrl();
            if (fileurl != undefined && domain != undefined && filename != undefined)
                resolve([getDomainUrl() + fileurl, filename]);
            resolve(['', '']);
        });
    });
}
//# sourceMappingURL=reportalert.js.map