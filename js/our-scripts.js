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
            switchPage(elem.attr('href'));
        }
    }
    
    timeLapse();
    return false;
}

function switchPage(url) {
    if (typeof(customSwitchPage) == 'function') {
        customSwitchPage(url);
    } else {
        alert('bla ' + url);
        location.href = url;
    }
}

$(function(){
    offerBetterStyle();
    $('.next').click(onNextButton);
});

function updatePreloadedContent(tagClassNameToPreloadIn, fileNameToLoad) {
    /* ihmo better to use 'classname:last' when load. there's no difference but i like it more */
}

function updateActionContent(tagClassNameToUpdate) {
    /* don't know how to realize this but as a last resort use 'classname:first' loads from 'classname:last' */
}