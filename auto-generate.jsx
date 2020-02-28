#include json\json2.js

var rawImagesFolder ='E:\\bussineses\\stationary\\catalogue\\photoshop\\rawImages\\';
var saveFolder='E:\\bussineses\\stationary\\catalogue\\photoshop\\finalImages\\';
var productJsonFile= 'productsJson/products.json';
var templatePsd ='auto1.psd';
var separatorGroup= 'separatorGroup';

var horizontalPicSize = [19 , 14];
var verticalPicSize = [13 , 14];

var horizontalPicPosition= [0 , -2.5];
var verticalPicPosition= [0, 0];



(function main(){
	 jsonObject= loadJson(productJsonFile);
	  pageCounter= 1;
	for( i=0; i< jsonObject.length; i++){
		if(jsonObject[i][0].code == "separator"){
			processSeparatorFrame(jsonObject[i]);
		}else{
			direction=loadImage(jsonObject[i][0].code , Array(horizontalPicSize,
													  verticalPicSize), Array(horizontalPicPosition,
													   verticalPicPosition));
			direction='horizontal';
			processFrame(jsonObject[i], direction);
		}
		pageCounter++;
	}
})();

function processSeparatorFrame(objSep){
	doc = app.documents.getByName(templatePsd);
	app.activeDocument = doc;
	doc.layerSets[0].visible = false;
	doc.layerSets[1].visible = false;
	doc.layerSets[2].visible = false;
	group = doc.layerSets.getByName(separatorGroup);
	group.visible = true;
	
	group.layers.getByName("pageNumber").textItem.contents= pageCounter;
	sepLayer= group.layers.getByName('groupName');
	sepLayer.textItem.contents= objSep[0].groupName;
	colorLayer= group.layers.getByName("bcgColor");
	paintSelection(objSep[0].color, colorLayer,1);
	
	saveJpeg(pageCounter);
}
function paintSelection(colorhexValue, colorLayer,selectAll, selectionArea){
	var groupColor= new SolidColor();
	groupColor.rgb["hexValue"] =colorhexValue;
	
	doc.activeLayer= colorLayer;
	if(selectAll == 1){
		app.activeDocument.selection.selectAll();
	}else{
		app.activeDocument.selection.select(selectionArea);
	}
	
	app.activeDocument.selection.fill(groupColor);
	app.activeDocument.selection.deselect();
	

}


function processFrame(objectConvertedFromJson, direction){
	doc = app.documents.getByName(templatePsd);
	app.activeDocument = doc;
	doc.layerSets[0].visible = false;
	doc.layerSets[1].visible = false;
	doc.layerSets[2].visible = false;
	group = doc.layerSets.getByName(direction);
	group.visible = true;
	
	group.layers.getByName("pageNumber").textItem.contents= pageCounter;
	productRowsNum= objectConvertedFromJson.length;
	var numberOfExistItems=0;
	for(x=0; x<productRowsNum; x++){
		if(objectConvertedFromJson[x].exists=="1"){
			numberOfExistItems = numberOfExistItems +1;
		}
	}
	alert(numberOfExistItems)
	rowGroup= group.layerSets.getByName("info").layerSets.getByName(numberOfExistItems+"row");
	rowGroup.visible= true;
	existCounter=1;
	for(k=0; k< productRowsNum; k++){
		if(objectConvertedFromJson[k].exists == "1"){
			if(objectConvertedFromJson[k].mdi == "1"){
				group.layers.getByName("mdi").visible= true;
			}else{
				group.layers.getByName("mdi").visible= false;
			}
			alert(existCounter);
			nameLayer= rowGroup.layerSets.getByName("l"+existCounter).layers.getByName("name");
			nameLayer.textItem.contents = objectConvertedFromJson[k].name;
			unitLayer= rowGroup.layerSets.getByName("l"+existCounter).layers.getByName("sellunit");
			unitLayer.textItem.contents = objectConvertedFromJson[k].sellunit;
			priceLayer= rowGroup.layerSets.getByName("l"+existCounter).layers.getByName('price');
			priceLayer.textItem.contents= objectConvertedFromJson[k].price;
			nameLayer= rowGroup.layerSets.getByName("l"+existCounter).layers.getByName("priceunit");
			nameLayer.textItem.contents = objectConvertedFromJson[k].priceunit;
			
			existCounter++;
		}
		
	}
	
	productColorLayer= group.layers.getByName("productColor");
	selectionArea= Array(Array(250,100),Array(550,100),Array(550,200),Array(250,100),Array(250,100));
	paintSelection(objectConvertedFromJson[0].color, productColorLayer,1,selectionArea);
	
	saveJpeg(pageCounter,direction);
	rowGroup.visible=false;
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
	UnitValue(imageNewSize[1], 'cm'),72, ResampleMethod.BICUBIC );
	imageDoc.activeLayer.copy();
	 doc = app.documents.getByName(templatePsd);
	app.activeDocument = doc;
	
	 imageGroup= doc.layerSets.getByName(direction[1]).layerSets.getByName("image");
	app.activeDocument.activeLayer = imageGroup;
	doc.paste().name = "imagee";
	imageGroup.artLayers[0].translate(UnitValue(transX ,'cm'),
										UnitValue(transY,'cm'));
	
	doc = app.documents.getByName(name +".png");
	doc.close(SaveOptions.DONOTSAVECHANGES);
	return direction[1];
	
}

	
function getDirection(imageX, imageY){
	if(imageX > imageY){
		rotation= Array(0, 'horizontal');
	}else{
		rotation= Array(1, 'vertical') ;
	}
	rotation= Array(0, 'horizontal');
	return rotation;
}

function fixImageSize(imageX, imageY, refX, refY){
	 newX = imageX;
	 newY = imageY;
	 nesbastAx = imageX / imageY;
	 nesbatRef = refX / refY ;
	 if( nesbastAx > nesbatRef){

			newY = refX / nesbastAx;
			newX = refX
		
		
	 }else{

			newX = refY * nesbastAx;
			newY = refY;
	 }

	return Array( newX  ,newY);

}

















