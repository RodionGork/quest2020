function offerBetterStyle() {
    if (localStorage['style-was-offered'] != undefined) {
        return;
    }
    var line = $('<div class="offer-style">Хотите попробовать улучшенное оформление?<br/>'
        + '<a href="#">ну давай!</a> / <a href="#">исчезни!</a></div>');
    line.insertBefore('.main-text');
    line.find('a:first').click(enableBetterStyle);
    line.find('a:last').click(function() {
        localStorage['style-was-offered'] = 'yes';
        line.hide(400);
        return false;
    });
}

function enableBetterStyle() {
    alert('А над ним пока еще Денис трудиццо...');
    return false;
}

function onNextButton() {
    var elem = $(this);
    
    var timeLapse = function() {
        var images = $('.action-space img');
        if (images.size() > 1) {
            var nextImg = $(images[1]);
            $(images[0]).attr('src', (nextImg.attr('src')));
            nextImg.remove();
            setTimeout(timeLapse, 700);
        } else {
            location.href = elem.attr('href');
        }
    }
    
    timeLapse();
    return false;
}

$(function(){
    offerBetterStyle();
    $('.next').click(onNextButton);
});
