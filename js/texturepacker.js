var $ = jQuery.noConflict();

// Максимальное количество загружаемых изображений за одни раз
var maxFiles = 40;
// Массив для всех изображений
var dataArray = [];


$(document).ready(function() {



	// В dataTransfer помещаются изображения которые перетащили в область div
	jQuery.event.props.push('dataTransfer');

	// Кнопка выбора файлов
	var defaultUploadBtn = $('#uploadbtn');


	// Область информер о загруженных изображениях - скрыта
	$('#uploaded-files').hide();

	// Метод при падении файла в зону загрузки
	$('#drop-files').on('drop', function(e) {
		// Передаем в files все полученные изображения
		var files = e.dataTransfer.files;
		// Проверяем на максимальное количество файлов
		if (files.length <= maxFiles) {
			// Передаем массив с файлами в функцию загрузки на предпросмотр
			loadInView(files);
		} else {
			alert('Вы не можете загружать больше '+maxFiles+' изображений!');
			files.length = 0; return;
		}
	});

	// При нажатии на кнопку выбора файлов
	defaultUploadBtn.on('change', function() {
   		// Заполняем массив выбранными изображениями
   		var files = $(this)[0].files;
   		// Проверяем на максимальное количество файлов
		if (files.length <= maxFiles) {
			// Передаем массив с файлами в функцию загрузки на предпросмотр
			loadInView(files);
			// Очищаем инпут файл путем сброса формы
            $('#frm').each(function(){
	        	    this.reset();
			});
		} else {
			alert('Вы не можете загружать больше '+maxFiles+' изображений!');
			files.length = 0;
		}
	});

	// Функция загрузки изображений на предросмотр
	function loadInView(files) {
		// Показываем обасть предпросмотра
		$('#uploaded-holder').show();

		// Для каждого файла
		$.each(files, function(index, file) {

			// Несколько оповещений при попытке загрузить не изображение
			if (!files[index].type.match('image.*')) {
    			$('#drop-files p').html('Only images!');
				return false;
			}

			// Проверяем количество загружаемых элементов
			if((dataArray.length+files.length) <= maxFiles) {
				// показываем область с кнопками
				$('#upload-button').css({'display' : 'block'});
			}
			else { alert('Вы не можете загружать больше '+maxFiles+' изображений!'); return; }

            var newimage = new Image();

			// Создаем новый экземпляра FileReader
			var fileReader = new FileReader();
				// Инициируем функцию FileReader
				fileReader.onload = (function(file) {
					//console.log(file.target);
					return function(e) {
                        newimage.src = e.target.result;
                        newimage.onload = function()
                        {
                            var newIdRnd = Math.floor((Math.random()*10000000000)+1);
						    // Помещаем URI изображения в массив
						    dataArray.push({
                                name : file.name,
                                value : e.target.result,
                                origWidth: this.naturalWidth, // оригинальный размер фотки
                                origHeight: this.naturalHeight, // оригинальный размер фотки
                                newWidth: this.naturalWidth,
                                newHeight: this.naturalHeight,
                                layerName: "",
                                frameWidth: this.naturalWidth,
                                frameHeight: this.naturalHeight,
                                frameCount: "1",
                                frameTime: "1000",
                                imageRndId: newIdRnd, // уникальный id изображения на полотне
                                imgOnPlace: "0", // установлено ли изображение на полотно
                                zIndex: "1", // порядок среди слоев
                                display: "1" // пометка для удаления изображений из списка
                            });
						    addImage((dataArray.length-1));
                        }
					};

				})(files[index]);
			// Производим чтение картинки по URI
			fileReader.readAsDataURL(file);
		});
        //
		return false;
	}


	// Функция удаления всех изображений
	function restartFiles() {

		// Установим бар загрузки в значение по умолчанию
		$('#loading-bar .loading-color').css({'width' : '0%'});
		$('#loading').css({'display' : 'none'});
		$('#loading-content').html(' ');

		// Удаляем все изображения на странице и скрываем кнопки
		$('#upload-button').hide();
		$('#dropped-files > .image-list').remove();
		$('#uploaded-holder').hide();

		// Очищаем массив
		dataArray.length = 0;

        $("#layerPrefForm input").val("");

		return false;
	}

	// Удалить все изображения кнопка
	$('#delete-block .delete').click(restartFiles);


	// Простые стили для области перетаскивания
	$('#drop-files').on('dragenter', function() {
		$(this).css({'box-shadow' : 'inset 0px 0px 20px rgba(0, 0, 0, 0.1)', 'background' : '#ececf0'});
		return false;
	});

	$('#drop-files').on('drop', function() {
		$(this).css({'box-shadow' : 'none', 'background' : ''});
		return false;
	});


    $( "#dropped-files" ).sortable({ containment: "parent", handle: ".dragButton" });

    $("#to-level-designer").click (function (){
        var newIdRnd = Math.floor((Math.random()*10000000000)+1);
        var canvas = document.getElementById("imgCanvas");
        var imgToLD = {
            name : "noname.img",
            value: canvas.toDataURL("image/png"),
            origWidth: canvas.width, // оригинальный размер фотки
            origHeight: canvas.height, // оригинальный размер фотки
            newWidth: dataArray[0].origWidth,
            newHeight: dataArray[0].origHeight,
            layerName: "",
            layerTop: "0",
            layerLeft: "0",
            frameWidth: dataArray[0].origWidth,
            frameHeight: dataArray[0].origHeight,
            frameCount: dataArray.length,
            frameTime: "1000",
            imageRndId: newIdRnd, // уникальный id изображения на полотне
            imgOnPlace: "0", // установлено ли изображение на полотно
            zIndex: "1", // порядок среди слоев
            display: "1" // пометка для удаления изображений из списка
        };

        window.opener.imgFromTexturePacker (imgToLD);
        //window.close();
    });


    function getIdFromString (elid) // получить id из строкового id параметра
    {
        // создаем массив для разделенных строк
        var temp = new Array();
        // делим строку id на 2 части
        temp = elid.split('-');
        return temp[1];
    }

        $(".save-project").click(function(){
            var canvas = document.getElementById("imgCanvas"), ctx = canvas.getContext("2d");
            // draw to canvas...
            canvas.toBlob(function(blob) {
                saveAs(blob, "sprite.png");
            });
        });

        $("#createImg").click(function(){
            var lenth = calcLayerSquare ();
            var imgCanvas = document.getElementById("imgCanvas");
            imgCanvas.width = lenth.width;
            imgCanvas.height = lenth.height;
            var ctx = imgCanvas.getContext('2d');  // Контекст холста

            $("#layer-block-container").css("width", lenth.width).css("height", lenth.height);

            var colsWCounter = 0; // счетчик количества выставленных картинок на ширине canvas
            var colsHCounter = 0; // счетчик количества выставленных картинок на высоте canvas

            var sortableArray = $( "#dropped-files" ).sortable( "toArray" );

            $.each(sortableArray, function(key, imgValues) {
            //for (var j=0; j<sortableArray.length; j++) {
                var i = getIdFromString (imgValues);

                //$("#layer-block-container").append('<img src="'+value.value+'">');

                var pic = new Image();  // "Создаём" изображение
                pic.src = dataArray[i].value;  // Источник изображения
                pic.onload = function() {  // Событие onLoad, ждём момента пока загрузится изображение

                    //console.log (colsWCounter + " x " + colsHCounter);
                    ctx.drawImage(pic, (colsWCounter * dataArray[i].origWidth), (colsHCounter * dataArray[i].origHeight));  // Рисуем изображение от точки с координатами 0, 0

                    if (colsWCounter < lenth.countInWidth-1) // какая по счету картинка на ширине canvas
                    {
                        colsWCounter++;
                    }
                    else
                    {
                        colsWCounter=0;
                        colsHCounter++;
                    }


                }

            }
            );
            //window.open(imgCanvas.toDataURL());
        });

});


// Процедура добавления эскизов на страницу
function addImage(ind) {

    // Если индекс отрицательный значит выводим весь массив изображений
    if (ind < 0 ) {
        start = 0; end = dataArray.length;
    } else {
        // иначе только определенное изображение
        start = ind; end = ind+1; }
    // Оповещения о загруженных файлах
    if(dataArray.length == 0) {
        // Если пустой массив скрываем кнопки и всю область
        $('#upload-button').hide();
        $('#uploaded-holder').hide();
    }
    // Цикл для каждого элемента массива
    for (i = start; i < end; i++) {
        // размещаем загруженные изображения
        if($('#dropped-files > .image-list > .image').length <= maxFiles) {
            //console.log (dataArray[i]);
            if (dataArray[i].display == "1")
                $('#dropped-files').append('<div id="img-'+i+'" class="row image-list"><div title="Click it" class="image span6" style="background: url('+dataArray[i].value+'); background-size: cover;"></div>'+dataArray[i].name+'<div class="btn dragButton" title="Move layer"><i class="icon-move"></i></div></div>');
        }
    }
    //calcLayerSquare ();
    //console.log (dataArray);

    return false;
}


function calcLayerSquare () // подсчет минимального квадрата в который впишутся все кадры
{
    var inWidth = 0;
    var inHeight = 0;

    var squareMin = 32;
    var inSquare = 0;

//        for (var i= squareMin; i <= 16384; i = i * 2)


    while (inSquare < dataArray.length)
    {
        squareMin = squareMin * 2;
        // сколько кадров вписывается в ширину квадрата
        inWidth = Math.floor (squareMin / dataArray[0].origWidth);
        inHeight = Math.floor (squareMin / dataArray[0].origHeight);

        var inSquare = inWidth * inHeight; // кадров на всей площади квадрата
        if (squareMin > 32768) {
            alert ("Very large frames");
            break;
        }
    }

    // рачет минимальной ширины
    var imgLength = {};
    if (dataArray.length < inWidth) inWidth = dataArray.length;

    imgLength.width = inWidth * dataArray[0].origWidth;
    var colsInHeight = Math.ceil (dataArray.length / inWidth);
    imgLength.height = colsInHeight * dataArray[0].origHeight;

    imgLength.countInWidth = inWidth; // количество кадров на ширине canvas
    //console.log (imgLength);
    return imgLength;

}