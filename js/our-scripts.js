var usingTemplate = false;


var lastPageChange = 0;

var serverSide = 'https://skripofon.ru/pths-quest.php';

function runTimeLapse() {
    var elem = $(this);
    
    var timeLapse = function() {
        if (!switchImage(timeLapse)) {
            switchPage(elem.attr('href'));
        }
    }
    
    $('.dialog-box').hide();
    $('.next-button').hide();
    timeLapse();
    return false;
}

function switchPage(url) {
    if (usingTemplate) {
        loadTemplateWithPage(url);
    } else {
        location.href = url;
    }
}

function loadTemplateWithPage(url, nowait) {
    localStorage['lastPage'] = url;
    checkPoint(url);
    lastPageChange = new Date().getTime();
    var whenLoaded = function(data) {
        data = data.replace(/span .lass..username..[^\<]+/, 'span class="username">' + localStorage['username']);
        var title = data.replace(/[\S\s]*\<title\>([\S\s]*)\<\/title\>[\S\s]*/, '$1')
        var body = data.replace(/[\S\s]*\<body\>([\S\s]+)\<\/body\>[\S\s]*/, '$1');
        var preloader = $('#preloader');
        preloader.html(body);
        preloader.find('img').each(function() {
            var e = $(this);
            e.attr('src', e.attr('src').replace(/^\.\./, '.'));
        });
        if (nowait) {
            setupLoadedPage(preloader, title, body);
        } else {
            var img = $('.main-image img:first');
            var delay = img.attr('lapse');
            img.fadeTo(delay ? delay * 1 : 750, 0, function() {
                setupLoadedPage(preloader, title, body);
            });
        }
    };
    $.ajax({
        url: './src/' + url,
        dataType: 'text',
        success: whenLoaded
    });
}

function setupLoadedPage(preloader, title, body) {
    $('.main-image').html(preloader.find('.action-space').html());
    var firstImage = $('.main-image img:first');
    firstImage.addClass('card').addClass('screen-image');
    playAudioIfAny(firstImage);
    preloader.find('.interaction-space p:not(:first)').addClass('secret');
    $('.dialog-box').html(preloader.find('.interaction-space').html());
    $('.dialog-box a.next').addClass('secret');
    $('.dialog-box p.quiz').each(decorateQuiz);
    $('.action-title').text(title);
    preloader.html('');
    $('.next-button').show();
    $('.dialog-box').show();
}

function playAudioIfAny(tag) {
    var sound = tag.attr('sound');
    if (typeof(sound) == 'undefined') {
        return;
    }
    new Audio('./sounds/' + sound).play();
}

function nextClicked() {
    var current = $('.dialog-box p:not(.secret):last');
    var textbox = current.find('input[type=text]:not(.skip)');
    if (textbox.size() > 0) {
        if (processTextbox(current, textbox)) {
            return;
        }
    }
    if (current.hasClass('quiz')) {
        if (processQuiz(current)) {
            return;
        }
    }
    var hidden = $('.dialog-box p.secret:first');
    if (hidden.size() > 0) {
        var f = function() {
            playAudioIfAny(hidden);
            hidden.show(300).removeClass('secret');
            if (hidden.hasClass('quiz')) {
                hidden.prevAll().remove();
            }
            hidden.prevAll('.quiz').remove();
        }
        if (hidden.attr('next-slide') === 'true') {
            switchImage(f);
        } else {
            f();
        }
    } else {
        $('.dialog-box a.next:first').click();
    }
    window.scrollTo(0,document.body.scrollHeight);
}

function processQuiz(current) {
    var ok = current.find('input:checked').parent('span').hasClass('right');
    if (!ok) {
        localStorage['score'] = localStorage['score'] * 1 - 1;
        var spans = current.find('.quiz-failures span');
        if (spans.size() == 0) {
            spans = $('.dialog-box > .quiz-failures span');
        }
        var fails = spans.size();
        var span = $(spans.get(Math.floor(Math.random() * fails)));
        span.show(500).delay(1500).hide(500);
        return true;
    }
    var msg = current.attr('ok');
    if (msg) {
        $('<span class="ok"/>').text(msg).appendTo(current).hide().show(500);
        current.removeAttr('ok');
        return true;
    }
    return false;
}

function processTextbox(current, textbox) {
    if (textbox.val() == '') {
        return true;
    }
    var txt = textbox.val().toLowerCase();
    var expected = textbox.attr('data-answer').toLowerCase();
    if (hashCode(txt) == expected || txt == expected) {
        $('<span/>').text(textbox.attr('data-ok')).insertAfter(textbox).css('color', 'green');
        return false;
    }
    localStorage['score'] = localStorage['score'] * 1 - 1;
    var attempts = textbox.attr('data-attempts');
    if (!attempts) {
        $('<span/>').text(textbox.attr('data-bad')).insertAfter(textbox).css('color', 'red');
        return false;
    }
    $('<span/>').text(textbox.attr('data-retry')).insertAfter(textbox).css('color', 'red')
        .hide(2500);
    attempts -= 1;
    if (attempts > 1) {
        textbox.attr('data-attempts', attempts);
    } else {
        textbox.removeAttr('data-attempts');
    }
    textbox.val('');
    return true;
}

function switchImage(f) {
    var images = $('.action-space .main-image img');
    if (images.size() < 2) {
        return false;
    }
    var curImg = $(images[0]);
    var nextImg = $(images[1]);
    var delay = curImg.attr('lapse');
    curImg.fadeTo(delay ? delay * 1 : 1100, 0.3, function() {
        var t = $('.dialog-box p').text();
        curImg.attr('src', (nextImg.attr('src')));
        playAudioIfAny(nextImg);
        curImg.attr('lapse', nextImg.attr('lapse'));
        nextImg.remove();
        curImg.fadeTo(200, 1.0, () => {if (typeof(f) == 'function') f()});
    });
    return true;
}

function decorateQuiz() {
    var quiz = $(this);
    var group = 'name' + quiz.prevAll().size();
    var spans = quiz.children('span:not(.quiz-failures)');
    spans.prepend('<input type="radio" name="' + group + '"/>').append('<br/>');
    spans.click(function() {
        $(this).children('input[type=radio]').prop('checked', true);
    });
    quiz.addClass('decorated');
}

function initTemplate() {
    usingTemplate = true;
    $('<div id="preloader" class="secret"></div>').appendTo('body');
    $('.next-button').click(nextClicked);
    var pageName = localStorage['lastPage'];
    var shortcut = location.href.search('#');
    if (shortcut > -1) {
        shortcut = location.href.substr(shortcut + 1);
        if (shortcut != 'reset') {
            localStorage['pages'] = '{}';
            localStorage['score'] = 0;
            pageName = shortcut + '.html';
        } else {
            pageName = undefined;
        }
    }
    if (!pageName) {
        pageName = 'title.html';
    }
    loadTemplateWithPage(pageName, true);
}

function queerAuthentication() {
    var code = $('#pass-card').val();
    $('#auth-wait').show();
    $.ajax({
        url: serverSide + '/card',
        type: 'POST',
        data: code,
        contentType: 'text/plain',
        dataType: 'text',
        success: function(res, status) {
            if (res == 'ok') {
                localStorage['userkey'] = code;
                $('#auth-bad').hide();
                $('#auth-ok').show(500);
            } else {
                $('#auth-bad').show(500);
            }
        }
    });
}

function checkPoint(url) {
    url = url.replace(/[\.\/]*([^\.]+)(?:\.html)/, '$1');
    var pages = JSON.parse(localStorage['pages']);
    if (!(url in pages)) {
        pages[url] = 1;
        localStorage['score'] = localStorage['score'] * 1 + 5;
        localStorage['pages'] = JSON.stringify(pages);
    }
    var userKey = localStorage['userkey'];
    if (typeof(userKey) == 'undefined') {
        return;
    }
    var delta = new Date().getTime() - lastPageChange;
    $.ajax({
        url: serverSide + '/checkpoint',
        type: 'POST',
        data: userKey + ' ' + url + ' ' + delta + ' ' + localStorage['score'],
        contentType: 'text/plain',
        dataType: 'text',
        success: function(res, status) {
        }
    });
}

function hashCode(s) {
    var res = 0;
    for (var i = 0; i < s.length; i++) {
        res = (res * 2) + s.charCodeAt(i);
        if (res > 65535) {
            res = (res + 1) % 65536;
        }
    }
    return res;
}

$(function(){
    if (!('pages' in localStorage)) {
        localStorage['pages'] = '{}';
        localStorage['score'] = 0;
    }
    if ($('.page-space').size() == 0) {
    } else {
        initTemplate();
    }
    $(document).on('click', 'a.next', runTimeLapse);
    $('p.quiz:not(.decorated)').each(decorateQuiz);
});
