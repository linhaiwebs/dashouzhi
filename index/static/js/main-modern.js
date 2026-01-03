let tokenId = null;
let endurl = null;

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    gsap.to('#loading-overlay', {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    });
}

window.onload = function () {
    showLoading();
    const params = new URLSearchParams(window.location.search);
    const requestUrl = '/api/tokenId?' + params.toString();
    fetch(requestUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.msg === "success") {
                tokenId = data.clickId;
                hideLoading();
            } else {
                console.error('API返回错误:', data);
            }
        })
        .catch(error => {
            console.error('API请求失败:', error);
        });
};

var params = new URLSearchParams(window.location.search);
var stockcode = params.get('code');
var stockName = "";
$('.sCode').text(stockcode);

if (!stockcode) {
    $('.error-box').show();
    setTimeout(() => {
        $('.error-box').hide();
    }, 5000);
}

$.ajax({
    url: '/api/stock/' + stockcode,
    type: 'get',
    dataType: 'json',
    success: function (res) {
        if (res.code === 200 && res.msg === "success") {
            const data = res.data;
            const info = data.info;
            const realTimeData = data.data[0];

            $('.gName').text(data.companyName.length > 3 ? data.companyName.substring(0, 3) + "（株）" : data.companyName);
            $('.tcname').text(data.companyName.length > 3 ? data.companyName.substring(0, 3) + "（株）" : data.companyName);
            $('.gCode').text(data.symbol);
            $('.previousClose').text(realTimeData[4]);
            $('.open').text(realTimeData[1]);
            $('.dayHigh').text(realTimeData[2]);
            $('.dayLow').text(realTimeData[3]);
            $('.volume').text(realTimeData[7]);
            $('.time').text(realTimeData[0]);

            const change = parseFloat(realTimeData[5]);
            const changePercentage = realTimeData[6];

            const $arrowContainer = $('.arrow-icon');
            $arrowContainer.empty();

            if (change >= 0) {
                $('.change').text('+' + change);
                $('.changesPercentage').text('(+' + changePercentage + '%)');
                $('.change,.changesPercentage,.price').css('color', '#dc3825');
                $arrowContainer.html('<div class="arrow-up"></div>');
            } else {
                $('.change').text(change);
                $('.changesPercentage').text('(' + changePercentage + '%)');
                $('.change,.changesPercentage,.price').css('color', '#03a20c');
                $arrowContainer.html('<div class="arrow-down"></div>');
            }

            updateCarousel(info, data.companyName, data.symbol);
        } else {
            $('.error-box').show();
            setTimeout(() => {
                $('.error-box').hide();
            }, 5000);
        }
    },
    error: function () {
        $('.error-box').show();
        setTimeout(() => {
            $('.error-box').hide();
        }, 5000);
    }
});

function updateCarousel(infoData, companyName, stockCode) {
    $('.tableList').empty();
    let newTr = "";
    infoData.slice(1).forEach((item) => {
        const colorClass = item[5].startsWith('+') ? 'red' : 'green';
        newTr = `
            <tr>
                <td class="td1">株 | ${stockCode}<br><span>${item[0]}</span></td>
                <td class="td2">終値：<span class="${colorClass}">${item[4]}</span>${companyName}<br>前日比：<span class="${colorClass}">${item[5]} (${item[6]}%)</span><br></td>
            </tr>`;
        $('.tableList').append(newTr);
    });
    scrollTable();
}

function scrollTable() {
    if (typeof animations !== 'undefined') {
        animations.scrollTable('.tableList', 108, 2500);
    } else {
        var i = 1;
        var len = $('.tableList tr').length;
        $('.tableList').append($('.tableList tr').clone());
        var _table = $('.tableList').eq(0);
        setInterval(function () {
            _table.css('marginTop', -108 * i);
            i++;
            if (i == len + 1) {
                setTimeout(function () {
                    _table.css('transition', 'none');
                    _table.css('marginTop', -6);
                    i = 1;
                    setTimeout(function () {
                        _table.css('transition', 'all .7s');
                    }, 700);
                }, 1000);
            }
        }, 2500);
    }
}

$('.dialog5_btn').click(function () {
    const endUrl = `/api/endurl?clickId=${tokenId}`;
    fetch(endUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.msg === "success") {
                endurl = data.data.redirectUrl;
                gtag_report_conversion(`${endurl}`);
            } else {
                console.error('API返回错误:', data);
            }
        })
        .catch(error => {
            console.error('API请求失败:', error);
        });
});

function getResults(sType) {
    setTimeout(() => {
        if ($('#SonContent0').is(":hidden")) {
            $(".discuss").html("データベースから" + sType + "レポートを取得中です...");
            animation();
            $("#SonContent0").show();
        }
    }, 10);
}

$('.submitBtn1').click(function () {
    getResults("診断");
    $('.sType').text("診断");
});

$('.submitBtn2,.btn_sz').click(function () {
    getResults("分析");
    $('.sType').text("分析");
});

$('.submitBtn3').click(function () {
    getResults("予測");
    $('.sType').text("予測");
});

$('.tan_close').click(function () {
    if ($(this).parent().css('display') == 'block') {
        if (typeof animations !== 'undefined') {
            animations.hideDialog($(this).parent().attr('id'));
        } else {
            $(this).parent().css("display", "none");
        }
        $('.zhegai').hide();
    }
});

function animation() {
    gtag('event', 'Bdd');

    if (typeof animations !== 'undefined' && animations.gsapLoaded) {
        animations.animateProgressBars(() => {
            setTimeout(function () {
                $("#SonContent0").hide();
                gsap.set([".charts", ".charts1", ".charts2"], { width: "0%" });
                $('.dialog-modern, .zhegai').show();
                animations.showDialog('.dialog-modern');
            }, 1000);
        });
    } else {
        $(".tan_title").css("padding-bottom", "20px");
        $(".charts").animate({
            width: "100%"
        }, 800, "", function () {
            $(".charts1").animate({
                width: "100%"
            }, 800, "", function () {
                $(".charts2").animate({
                    width: "100%"
                }, 800, "", function () {
                    setTimeout(function () {
                        $("#SonContent0").hide();
                        $(".charts, .charts1, .charts2").stop(true);
                        $(".charts, .charts1, .charts2").width("0px");
                        $('.tan_400').css('background-color', '#fff').css('border-radius', '0');
                        $('.discuss').css('display', 'inline-block').css('padding', '24px').css('padding-bottom', '56px');
                        $('.barbox').show();
                        $('.dialog-modern,.zhegai').show();
                    }, 1000);
                });
            });
        });
    }
}

if (typeof animations !== 'undefined') {
    animations.createRippleEffect('.btn-modern');
    animations.addHoverEffect('.folder-icon');
    animations.animateOnScroll('.icon-item', 'fadeInUp');
}

const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
