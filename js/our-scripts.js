var usingTemplate = false;

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
    var whenLoaded = function(data) {
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
            $('.main-image img:first').fadeTo(700, 0, function() {
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
    var textbox = current.find('input[type=text]');
    if (textbox.size() > 0) {
        if (textbox.val().toLowerCase() == textbox.attr('data-answer').toLowerCase()) {
            $('<span/>').text(' ' + textbox.attr('data-ok')).insertAfter(textbox).css('color', 'green');
        } else {
            $('<span/>').text(' ' + textbox.attr('data-bad')).insertAfter(textbox).css('color', 'red');
        }
    }
    if (current.hasClass('quiz')) {
        var ok = current.find('input:checked').parent('span').hasClass('right');
        if (!ok) {
            var spans = current.find('.quiz-failures span');
            if (spans.size() == 0) {
                spans = $('.dialog-box > .quiz-failures span');
            }
            var fails = spans.size();
            var span = $(spans.get(Math.floor(Math.random() * fails)));
            span.show(500).delay(1500).hide(500);
            return;
        }
    }
    var hidden = $('.dialog-box p.secret:first');
    if (hidden.size() > 0) {
        var f = function() {
            hidden.show(300).removeClass('secret');
            if (hidden.hasClass('quiz')) {
                hidden.prevAll().remove();
            }
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

function switchImage(f) {
    var images = $('.action-space .main-image img');
    if (images.size() < 2) {
        return false;
    }
    var curImg = $(images[0]);
    var nextImg = $(images[1]);
    curImg.fadeTo(500, 0.3, function() {
        var t = $('.dialog-box p').text();
        curImg.attr('src', (nextImg.attr('src')));
        playAudioIfAny(nextImg);
        nextImg.remove();
        curImg.fadeTo(200, 1.0, () => {if (typeof(f) == 'function') f()});
    });
    return true;
}

function decorateQuiz() {
    var quiz = $(this);
    var group = 'name' + quiz.prevAll().size();
    quiz.children('span:not(.quiz-failures)').prepend('<input type="radio" name="' + group + '"/>').append('<br/>');
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
            pageName = shortcut + '.html';
        } else {
            pageName = undefined;
        }
    }
    if (!pageName) {
        pageName = 'Metro_Polytech.html';
    }
    loadTemplateWithPage(pageName, true);
}

$(function(){
    if ($('.page-space').size() == 0) {
    } else {
        initTemplate();
    }
    $(document).on('click', 'a.next', runTimeLapse);
    $('p.quiz:not(.decorated)').each(decorateQuiz);
});
