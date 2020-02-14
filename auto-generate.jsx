#include json\json2.js

var rawImagesFolder ='E:\\bussineses\\stationary\\catalogue\\photoshop\\rawImages\\';
var saveFolder='E:\\bussineses\\stationary\\catalogue\\photoshop\\finalImages\\';
var productJsonFile= '/productsJson/products.txt';
var templatePsd ='auto1.psd';

var horizontalPicSize = [18 , 10.5];
var verticalPicSize = [13 , 15];

horizontalPicPosition= [7.51+2 , 3.49];
verticalPicPosition= [14 , 4.5];



(function main(){
	 jsonObject= loadJson(productJsonFile);
        alert(jsonObject.length);
	for( i=0; i< 2; i++){
		 direction=loadImage(jsonObject[i].id , Array(horizontalPicSize,
												  verticalPicSize), Array(horizontalPicPosition,
												   verticalPicPosition));
		processFrame(jsonObject[i]	,direction);
	}
	
	
})();

function processFrame(objectConvertedFromJson, direction){
	doc = app.documents.getByName(templatePsd);
	app.activeDocument = doc;
	doc.layerSets[0].visible = false;
	doc.layerSets[1].visible = false;
	group = doc.layerSets.getByName(direction);
	group.visible = true;
	infoGroup= group.layerSets.getByName("info");
		nameLayer= infoGroup.layers.getByName("name");
		nameLayer.textItem.contents = objectConvertedFromJson.name;
		unitLayer= infoGroup.layers.getByName("unit");
		unitLayer.textItem.contents = objectConvertedFromJson.unit;
		priceLayer= infoGroup.layers.getByName('price');
		priceLayer.textItem.contents= objectConvertedFromJson.price;
	
	saveJpeg(objectConvertedFromJson.name,direction);
	doc.layerSets.getByName(direction).layerSets.getByName("image").artLayers[0].remove();
}

function loadJson(relPath){
	 script= new File($.fileName);
	 jsonFile= new File(script.path + '/'+ relPath);
	jsonFile.open('r');
	 str= jsonFile.read();
	jsonFile.close();
	return JSON.parse(str);
}


function saveJpeg(name, direction){
	 doc= app.activeDocument;
	 file = new File(saveFolder+'/'+ name + '.jpeg');
	 opts= new JPEGSaveOptions();
	opts.quality = 10;
	

	doc.saveAs(file, opts, true);
	
}

function loadImage(name,sizeArr, pArray){
	 imageDoc=open(File(rawImagesFolder + name +".png"));
	app.activeDocument = imageDoc;
	 direction= getDirection(imageDoc.width.value, imageDoc.height.value);
	 directionIndex = direction[0];
	 transX = pArray[directionIndex][0];
	 transY = pArray[directionIndex][1];
	 
	 imageNewSize = fixImageSize(imageDoc.width.value, 
												imageDoc.height.value, 
												sizeArr[directionIndex][0],
												sizeArr[directionIndex][1]);
												
	imageDoc.resizeImage(UnitValue(imageNewSize[0],'cm' ),
	UnitValue(imageNewSize[1], 'cm') );
	imageDoc.activeLayer.copy();
	 doc = app.documents.getByName(templatePsd);
	app.activeDocument = doc;
	
	 imageGroup= doc.layerSets.getByName(direction[1]).layerSets.getByName("image");
	app.activeDocument.activeLayer = imageGroup;
	doc.paste().name = "imagee";
	  imagePosX= UnitValue(imageGroup.artLayers[0].bounds[0] , 'cm');
	  imagePosy= UnitValue(imageGroup.artLayers[0].bounds[1] , 'cm');
	imageGroup.artLayers[0].translate(UnitValue(transX ,'cm')-imagePosX,
										UnitValue(transY,'cm') - imagePosy);

	return direction[1];
}

function fixImagePosition(image, xPosition, yPosition){
	
	image.translate(UnitValue(xPosition ,'cm'), UnitValue(yPosition,'cm'))
}

function createSelection(sizeArr, posArr){
	sizeArr=Array(200,200);
	posArr= Array(200,200);
	 selRegion= Array(Array( posArr[0], posArr[1]),
						Array( posArr[0] + sizeArr[0], posArr[1]),
						Array( posArr[0] + sizeArr[0], posArr[1] + sizeArr[1]),
						Array( posArr[0] , posArr[1] + sizeArr[1]),
						Array( posArr[0] , posArr[1] ) );
		return selRegion;
	}
	
function getDirection(imageX, imageY){
	if(imageX > imageY){
		rotation= Array(0, 'horizontal');
	}else{
		rotation= Array(1, 'vertical') ;
	}
	return rotation;
}

function fixImageSize(imageX, imageY, refX, refY){
	 newX = imageX;
	 newY = imageY;
	 nesbastAx = imageX / imageY;
	 nesbatRef = refX / refY ;
	 if( nesbastAx > nesbatRef){
		if(imageX > refX){
			newY = refX / nesbastAx;
			newX = refX
		}
	 }else{
		if(imageX > refX){
			newX = refY * nesbastAx;
			newY = refY;
		}
	 }

	return Array( newX  ,newY);

}

















