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

$(function(){
    offerBetterStyle();
});
