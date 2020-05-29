var paint = new PaintJS({paint: "#paint"});

function onFinishPaint() {
	var base64 = paint.canvas.toDataURL();
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://skripofon.ru/pths-quest.php/pics?k=' + localStorage['userkey']);
	xhr.send(base64);
	alert('Окей... Зачтём. Переходи теперь обратно. Урок рисования закончен.');
}
