var usingTemplate = false;

function onNextButton() {
    var elem = $(this);
    
    var timeLapse = function() {
        var images = $('.action-space .main-image img');
        if (images.size() > 1) {
            var nextImg = $(images[1]);
            $(images[0]).attr('src', (nextImg.attr('src')));
            nextImg.remove();
            setTimeout(timeLapse, 700);
        } else {
            switchPage(elem.attr('href'));
        }
    }
    
    timeLapse();
    return false;
}

function switchPage(url) {
    if (usingTemplate) {
        loadTemplateWithPage(url);
    } else {
        alert('bla ' + url);
        location.href = url;
    }
}

function loadTemplateWithPage(url) {
    var whenLoaded = function(data) {
        var title = data.replace(/[\S\s]*\<title\>([\S\s]+)\<\/title\>[\S\s]*/, '$1')
        var body = data.replace(/[\S\s]*\<body\>([\S\s]+)\<\/body\>[\S\s]*/, '$1');
        var preloader = $('#preloader');
        preloader.html(body);
        $('.main-image').html(preloader.find('.action-space').html());
        $('.main-image img:first').addClass('card').addClass('screen-image');
        $('.main-image img').each(function() {
            var e = $(this);
            e.attr('src', e.attr('src').replace(/^\.\./, '.'));
        });
        $('.dialog-box').html(preloader.find('.interaction-space').html());
        $('.dialog-box a.next').addClass('secret');
        $('.action-title').text(title);
        preloader.html('');
        //$('.next').click(onNextButton);
    };
    $.ajax({
        url: './src/' + url,
        dataType: 'text',
        success: whenLoaded
    });
}

function nextClicked() {
    $('.dialog-box a.next:first').click();
}

function initTemplate() {
    usingTemplate = true;
    $('<div id="preloader" class="secret"></div>').appendTo('body');
    $('.next-button').click(nextClicked);
    switchPage('Metro_Polytech.html');
}

$(function(){
    if ($('.page-space').size() == 0) {
    } else {
        initTemplate();
    }
    $(document).on('click', 'a.next', onNextButton);
});
