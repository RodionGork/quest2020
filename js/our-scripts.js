var usingTemplate = false;

function onNextButton() {
    var elem = $(this);
    
    var timeLapse = function() {
        var images = $('.action-space .main-image img');
        if (images.size() > 1) {
            var curImg = $(images[0]);
            var nextImg = $(images[1]);
            curImg.fadeTo(500, 0.3, function() {
                var t = $('.dialog-box p').text();
                curImg.attr('src', (nextImg.attr('src')));
                nextImg.remove();
                curImg.fadeTo(200, 1.0, timeLapse);
            });
        } else {
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
    $('.main-image img:first').addClass('card').addClass('screen-image');
    preloader.find('.interaction-space p:not(:first)').addClass('secret');
    $('.dialog-box').html(preloader.find('.interaction-space').html());
    $('.dialog-box a.next').addClass('secret');
    $('.dialog-box p.quiz').each(decorateQuiz);
    $('.action-title').text(title);
    preloader.html('');
    $('.next-button').show();
    $('.dialog-box').show();
}

function nextClicked() {
    var current = $('.dialog-box p:not(.secret):first');
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
        hidden.show(300).removeClass('secret');
        if (hidden.hasClass('quiz')) {
            hidden.prevAll().remove();
        }
    } else {
        $('.dialog-box a.next:first').click();
    }
    window.scrollTo(0,document.body.scrollHeight);
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
    var pageName = 'Metro_Polytech.html';
    var shortcut = location.href.search('#');
    if (shortcut > -1) {
        pageName = location.href.substr(shortcut + 1) + '.html';
    }
    loadTemplateWithPage(pageName, true);
}

$(function(){
    if ($('.page-space').size() == 0) {
    } else {
        initTemplate();
    }
    $(document).on('click', 'a.next', onNextButton);
    $('p.quiz:not(.decorated)').each(decorateQuiz);
});
