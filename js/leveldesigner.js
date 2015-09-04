var $ = jQuery.noConflict();
var scaleVal = 1.0;

// Максимальное количество загружаемых изображений за одни раз
var maxFiles = 20;
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
                                layerTop: "0",
                                layerLeft: "0",
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


    // Панель настроек слоя
    $("#dropped-files").on("click",".image", function() {
        //console.log ($(this).children("a[id^='drop']").attr("id"));
        // получаем название id от ссылки удаления картинки
         var elid = $(this).children("a[id^='drop']").attr("id");
        // создаем массив для разделенных строк
        var temp = new Array();
        // делим строку id на 2 части
        temp = elid.split('-');
        setPrefForm (temp[1]);
    });

    // Удаление только выбранного изображения
    $("#dropped-files").on("click","a[id^='drop']", function() {
        // получаем название id
         var elid = $(this).attr('id');
        //console.log (elid);
        // создаем массив для разделенных строк
        var temp = new Array();
        // делим строку id на 2 части
        temp = elid.split('-');

        if (dataArray[temp[1]].imgOnPlace == "1") { // удаляем с полотна картинку
            $("#send-"+temp[1]).click();
        }
        dataArray[temp[1]].display = 0;
        // получаем значение после тире тоесть индекс изображения в массиве
        //dataArray.splice(temp[1],1);
        // Удаляем старые эскизы
        $('#dropped-files > .image-list').remove();
        // Обновляем эскизи в соответсвии с обновленным массивом
        addImage(-1);
    });

	// Добавление выбранного изображения на слой
	$("#dropped-files").on("click","a[id^='send']", function() {
		// получаем название id
 		var elid = $(this).attr('id');

		// создаем массив для разделенных строк
		var temp = new Array();
		// делим строку id на 2 части
		temp = elid.split('-');
		// получаем значение после тире тоесть индекс изображения в массиве
		//dataArray.splice(temp[1],1);
		// отправляем изображение на слой




        if (dataArray[temp[1]].imgOnPlace == "0") {
            dataArray[temp[1]].imgOnPlace = "1"; // устанавливаем флаг что изображение на полотне
            $(this).children("i").removeClass("icon-arrow-right").addClass('icon-arrow-left');

            //$("#iframe-layer-block").contents().find("#layer-block").append ('<canvas id="canv-'+temp[1]+'" width="'+dataArray[temp[1]].newWidth+'" height="'+dataArray[temp[1]].newHeight+'"><img id="layerimg-'+temp[1]+'" src="'+dataArray[temp[1]].value+'" width="'+dataArray[temp[1]].newWidth+'" height="'+dataArray[temp[1]].newHeight+'" style="position:absolute; top:'+dataArray[temp[1]].layerTop+'px; left:'+dataArray[temp[1]].layerLeft+'px;"></canvas>');
            $("#iframe-layer-block").contents().find("#layer-block").append ('<canvas id="canv-'+temp[1]+'" width="'+dataArray[temp[1]].newWidth+'" height="'+dataArray[temp[1]].newHeight+'" style="position:absolute;"></canvas>');

            showImgCanvas (temp[1]);

            document.getElementById("iframe-layer-block").contentWindow.setDraggable ('#canv-'+temp[1]);
            document.getElementById("iframe-layer-block").contentWindow.setZindex (dataArray);
            document.getElementById("iframe-layer-block").contentWindow.setPref (dataArray[temp[1]], temp[1]);
        }
        else {
            dataArray[temp[1]].imgOnPlace = "0"; // устанавливаем флаг что изображение НЕ на полотне
            $(this).children("i").removeClass("icon-arrow-left").addClass('icon-arrow-right');
            $("#iframe-layer-block").contents().find("#layerimg-"+temp[1]).remove();
            $("#iframe-layer-block").contents().find("#canv-"+temp[1]).remove();
        }

        //$("#layer-block").append ('<img id="layerimg-'+newIdRnd+'" src="'+dataArray[temp[1]].value+'" width="'+dataArray[temp[1]].newWidth+'" height="'+dataArray[temp[1]].newHeight+'">');
        //$("#layer-block").append ('<img id="layerimg-'+newIdRnd+'" src="'+dataArray[temp[1]].value+'" width="'+dataArray[temp[1]].newWidth+'" height="'+dataArray[temp[1]].newHeight+'">');

	});

	function showImgCanvas (id)
    {

              var canvas = $("#iframe-layer-block").contents().find('#canv-'+id)[0];
              $(canvas).attr("width", dataArray[id].newWidth)
              .attr("height", dataArray[id].newHeight)
              .css("top", dataArray[id].layerTop)
              .css("left", dataArray[id].layerLeft);
              var context = canvas.getContext('2d');
              var imageObj = new Image();

              imageObj.onload = function() {
                // draw cropped image
                var sourceX = 0;
                var sourceY = 0;
                var sourceWidth = dataArray[id].frameWidth;
                var sourceHeight = dataArray[id].frameHeight;
                var destWidth = dataArray[id].newWidth;
                var destHeight = dataArray[id].newHeight;
                var destX = canvas.width / 2 - destWidth / 2;
                var destY = canvas.height / 2 - destHeight / 2;

                context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
              };
              imageObj.src = dataArray[id].value;
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


    $('#layerPrefForm').submit(function() {
            var id = $("#layerPrefForm #layerId").val();
            dataArray[id].name = $("#layerPrefForm #imgName").val();
            dataArray[id].layerName = $("#layerPrefForm #layername").val();
            dataArray[id].newWidth = $("#layerPrefForm #layerWidth").val();
            dataArray[id].newHeight = $("#layerPrefForm #layerHeight").val();
            dataArray[id].layerTop = $("#layerPrefForm #layerTop").val();
            dataArray[id].layerLeft = $("#layerPrefForm #layerLeft").val();
            dataArray[id].frameWidth = $("#layerPrefForm #frameW").val();
            dataArray[id].frameHeight = $("#layerPrefForm #frameH").val();
            dataArray[id].frameCount = $("#layerPrefForm #frameC").val();
            dataArray[id].frameTime = $("#layerPrefForm #frameTime").val();
            console.log (dataArray);

            if (dataArray[id].imgOnPlace == "1") {  // если изображение на полотне то обновляем его свойства
                document.getElementById("iframe-layer-block").contentWindow.setPref (dataArray[id], id);

                showImgCanvas (id);
            }

            return false;
    });

    function getIdFromString (elid) // получить id из строкового id параметра
    {
        // создаем массив для разделенных строк
        var temp = new Array();
        // делим строку id на 2 части
        temp = elid.split('-');
        return temp[1];
    }

        $( "#dropped-files" ).on( "sortupdate", function( event, ui ) {
                var sortableArray = $( "#dropped-files" ).sortable( "toArray" );
                for (var i=0; i<sortableArray.length; i++)
                {
                    var id = getIdFromString (sortableArray[i]);
                    dataArray[id].zIndex = i+1;

                }
                //console.log (dataArray);
                document.getElementById("iframe-layer-block").contentWindow.setZindex (dataArray);
            });

       $( "#dropped-files" ).sortable({ containment: "parent", handle: ".dragButton" });
       //$( "#sortable" ).disableSelection();

       $("#frameW").change( function() {
           $("#layerWidth").val($(this).val());
       });
       $("#frameH").change( function() {
           $("#layerHeight").val($(this).val());
       });

       $("#HorFramesInput").change( function() {
           var horFrames = parseInt($("#horFrames").val()) / parseInt($("#HorFramesInput").val());
           $("#layerWidth").val(horFrames);
           $("#frameW").val(horFrames);
       });
       $("#VertFramesInput").change( function() {
           var vertFrames = parseInt($("#vertFrames").val()) / parseInt($("#VertFramesInput").val());
           $("#layerHeight").val(vertFrames);
           $("#frameH").val(vertFrames);
       });

       $("#layerPrefForm input[type='text']").change(function(){
           $('#layerPrefForm').submit();
       });

       $("#layerPrefForm input[type='text']").click(function(){
            // Select input field contents
            this.select();
        });
       $("#autoCompleteTextLayer").click(function(){
           $("#layername").val("TextLayer");
           $('#layerPrefForm').submit();
       });

        $(".new-sprite").click(function(){
            var params = "menubar=no,location=no,resizable=no,scrollbars=yes,status=no"
            window.open("/texturepacker.html", "texturepacker", params);
        });

        $(".save-project").click(function(){
            //console.log (obj2json (dataArray));
            var blobText = new Blob([obj2json (dataArray)], {type: "text/plain;charset=utf-8"});
            saveAs(blobText, "project.txt");
        });

        function draggableAfterScale ()
        {
            if (parseFloat (scaleVal) != 1.0)
                document.getElementById("iframe-layer-block").contentWindow.disableDraggable (); // пока не знаю как корректно сделать таскание после scale
            else
                document.getElementById("iframe-layer-block").contentWindow.enableDraggable ();
        }
       $("#scaleMinus").click(function(){
            if (scaleVal > (parseFloat ("0.2")))
                scaleVal = scaleVal - 0.1;
            $("#scaleNum").val(scaleVal.toFixed(1));
           draggableAfterScale ();
            document.getElementById("iframe-layer-block").contentWindow.scaleApply (scaleVal.toFixed(1));
       });
       $("#scalePlus").click(function(){
            if (scaleVal < (parseFloat ("2")))
                scaleVal = scaleVal + 0.1;
            $("#scaleNum").val(scaleVal.toFixed(1));
           draggableAfterScale ();
            document.getElementById("iframe-layer-block").contentWindow.scaleApply (scaleVal.toFixed(1));
       });

    $(".open-project").click (function(e){
        $("#fileElem").click();
        e.preventDefault(); // prevent navigation to "#"
    });

       $("#saveFile").click (function () {
var blobText = 'module(..., package.seeall)\n\n' +
'require ("config")\n' +
'require ("sprite")\n' +
'imgSubFolder = ""\n' +
'spriteSets={}\n' +
'if (application.LevelDirectorSettings.imagesSubfolder ~= nil) then\n' +
'imgSubFolder = application.LevelDirectorSettings.imagesSubfolder\n' +
'imgSubFolder = imgSubFolder .. "/"\n' +
'end\n' +
    '\n' +
'if (application.LevelDirectorSettings.soundsSubfolder ~= nil) then\n'+'sndSubFolder = application.LevelDirectorSettings.soundsSubfolder\n'+
'sndSubFolder = sndSubFolder .. "/"\n'+
'end\n'+
    '\n' +
'function CreateLevel()\n' +
'display.setDefault( "background", 105,105,105 )\n' +
'local level = display.newGroup()\n' +
'level.layers = {}\n' +
    '\n';

var sortableArray = $( "#dropped-files" ).sortable( "toArray" );

for (var j=0; j<sortableArray.length; j++) {

  var i = getIdFromString (sortableArray[j]);

  if (dataArray[i].imgOnPlace == "1") {
    if (dataArray[i].frameCount == 1) {

        if (dataArray[i].layerName == 'TextLayer')
            blobText = blobText + 'if showTextBlock == true then\n';

        blobText = blobText +
        '---- Layer : New Layer ----\n' +
        'level.layers["'+dataArray[i].layerName+'"] = display.newGroup()\n' +
        'level.layers["'+dataArray[i].layerName+'"] = display.newImageRect( imgSubFolder .. "'+dataArray[i].name+'",'+dataArray[i].newWidth+','+dataArray[i].newHeight+' )\n' +
        'level.layers["'+dataArray[i].layerName+'"]:setReferencePoint(display.TopLeftReferencePoint);\n' +
        'level.layers["'+dataArray[i].layerName+'"].x = '+dataArray[i].layerLeft+'\n' +
        'level.layers["'+dataArray[i].layerName+'"].y = '+dataArray[i].layerTop+'\n' +
        'level:insert(level.layers["'+dataArray[i].layerName+'"])\n' +
        '\n';

        if (dataArray[i].layerName == 'TextLayer') {
            blobText = blobText +
                'TextBlock.x=level.layers["TextLayer"].x\n' +
                'TextBlock.y=level.layers["TextLayer"].y\n' +
                'end\n' +
                '\n';
        }

    }
    else if (dataArray[i].frameCount > 1) { // если это спрайт
        blobText = blobText +
'level.layers["'+dataArray[i].layerName+'"] = display.newGroup()\n' +
'spriteSheets.scene_'+dataArray[i].layerName+'_png = sprite.newSpriteSheet( imgSubFolder .. "'+dataArray[i].name+'", '+dataArray[i].frameWidth+','+dataArray[i].frameHeight+')\n' +
'local scene_'+dataArray[i].layerName+'_png_Set = sprite.newSpriteSet(spriteSheets.scene_'+dataArray[i].layerName+'_png, 1,'+dataArray[i].frameCount+')\n' +
'level.layers["'+dataArray[i].layerName+'"] = sprite.newSprite(scene_'+dataArray[i].layerName+'_png_Set)\n' +
'level.layers["'+dataArray[i].layerName+'"].currentFrame = '+dataArray[i].frameCount+'\n' +
'level.layers["'+dataArray[i].layerName+'"]:setReferencePoint(display.TopLeftReferencePoint);\n' +
'level.layers["'+dataArray[i].layerName+'"].x = '+dataArray[i].layerLeft+'\n' +
'level.layers["'+dataArray[i].layerName+'"].y = '+dataArray[i].layerTop+'\n' +
'sprite.add( scene_'+dataArray[i].layerName+'_png_Set, "'+dataArray[i].layerName+'", 1, '+dataArray[i].frameCount+', '+dataArray[i].frameTime+', 2 )\n' +
'level:insert(level.layers["'+dataArray[i].layerName+'"])\n' +
'arrayAnimObjects['+i+'] = {nameObj=level.layers["'+dataArray[i].layerName+'"], nameAnim="'+dataArray[i].layerName+'" }\n' +
'\n';

    }
  }
}

blobText = blobText +
    'return level\n' +
    'end\n';

           var blob = new Blob([blobText], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "scene.lua");
       });

});



function setPrefForm (id) // установка значений в полях формы настройки слоя
{
    $("#layerPrefForm #layerId").val(id);
    $("#layerPrefForm #horFrames").val(dataArray[id].origWidth);
    $("#layerPrefForm #vertFrames").val(dataArray[id].origHeight);

    $("#layerPrefForm #imgName").val(dataArray[id].name);

    if (dataArray[id].layerName == "") dataArray[id].layerName = "img_"+id;
    $("#layerPrefForm #layername").val(dataArray[id].layerName);

    $("#layerPrefForm #layerWidth").val(dataArray[id].newWidth);
    $("#layerPrefForm #layerHeight").val(dataArray[id].newHeight);
    $("#layerPrefForm #layerTop").val(dataArray[id].layerTop);
    $("#layerPrefForm #layerLeft").val(dataArray[id].layerLeft);
    $("#layerPrefForm #frameW").val(dataArray[id].frameWidth);
    $("#layerPrefForm #frameH").val(dataArray[id].frameHeight);
    $("#layerPrefForm #frameC").val(dataArray[id].frameCount);
    $("#layerPrefForm #frameTime").val(dataArray[id].frameTime);

    $("#layerPrefForm #HorFramesInput").val("");
    $("#layerPrefForm #VertFramesInput").val("");

}

function updatePref (id, pref)
{
    dataArray[id].layerTop = pref.top;
    dataArray[id].layerLeft = pref.left;
    setPrefForm (id)
}


function obj2json(_data){ // сохранение массива в JSON формат
    str = (($.type(_data)== 'array')?'{ ': '{ ');
    first = true;
    $.each(_data, function(i, v) {
        if(first != true)
            str += ",";
        else first = false;
        if ($.type(v)== 'object' )
            str += '"' + i + '":' + obj2json(v) ;
        else if ($.type(v)== 'array')
            str += '"' + i + '":' + obj2json(v) ;
        else{
            if($.type(_data)== 'array')
                str += '"' + v + '"';
            else
                str +=  '"' + i + '":"' + v + '"';
        }
    });
    return str+= (($.type(_data)== 'array')? ' } ':' } ');
}

function handleProjectFiles(files) { // чтение файла проекта
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileType = /text.plain/;

        if (!file.type.match(fileType)) {
            continue;
        }

        if (files[0]) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                //console.log (contents);
                var tempObj = $.parseJSON (contents);
                $.each( tempObj, function( key, value ) {
                    //console.log( key + ": " + value );
                    dataArray[key] = value;
                });
                //console.log (dataArray);
                addImage(-1);
                $('#uploaded-holder').show();
                setPrefFromProject();
            }
            r.readAsText(files[0]);
        } else {
            alert("Failed to load file");
        }

    }
}

// перебор всего массива и установка параметров картинок на полотне
function setPrefFromProject()
{
    $.each( dataArray, function( key, value ) {
        if (value.imgOnPlace == '1') {// если картинка должна быть на полотне отправляем ее туда
            value.imgOnPlace = 0;
            $("#send-"+key).click();
            document.getElementById("iframe-layer-block").contentWindow.setPref (dataArray[key], key);
        }
    });
}

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
                $('#dropped-files').append('<div id="img-'+i+'" class="row image-list"><div title="Click it" class="image span6" style="background: url('+dataArray[i].value+'); background-size: cover;"> <a href="#" id="drop-'+i+'" class="drop-button"><i class="icon-trash icon-white"></i></a></div><div class="span6 image-send"><a class="btn" title="Send to layer" id="send-'+i+'"><i class="icon-arrow-right"></i></a></div><div class="btn dragButton" title="Move layer"><i class="icon-move"></i></div></div>');
        }
    }
    return false;
}

function imgFromTexturePacker (imgFromTP) // добавить картинку из texture packer в список
{
    dataArray.push(imgFromTP);
    addImage((dataArray.length-1));
}
