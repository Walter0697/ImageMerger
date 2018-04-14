var inputImage = null;
var input2Image = null;

var mode;

$(document).ready(function(){
	toMerge();
});

function imageHandler(input, place)
{
	if (input.files && input.files[0])
	{
		var reader = new FileReader();
	
		reader.onload = function(e) {
			if (place == 1)
			{
				$('#imageContainer').attr('src', e.target.result);
				inputImage = e.target.result;
			}
			else
			{
				$('#image2Container').attr('src', e.target.result);
				input2Image = e.target.result;
			}
		}
		reader.readAsDataURL(input.files[0]);
	}
}

function init()
{
	$('input').val('');
	inputImage = null;
	input2Image = null;
	$('.allImage').attr('src', "assets/spliter.png");
	$(".split").hide();
	$(".merge").hide();
	$(".addCode").hide();
	$(".getCode").hide();
}

function toMerge()
{
	init();
	
	mode = "merge";
	$(".merge").show();
}

function toSplit()
{
	init();
	
	mode = "split";
	$(".split").show();
}

function toAddCode()
{
	init();
	
	mode = "addCode";
	$(".addCode").show();
}

function toGetCode()
{
	init();
	
	mode = "getCode";
	$(".getCode").show();
}

function getRandomInt(number)
{
	return Math.floor(Math.random() * Math.floor(number));
}

//really awesome way to think about it
//code is from here: https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
function dec2bin(dec){
	return (dec >>> 0).toString(2);
}

function analysisImage()
{
	if (mode == "split")
		splitImage();
	else if (mode == "merge")
		mergeImage();
	else if (mode == "addCode")
		addCode();
	else if (mode == "getCode")
		getCode();
}

function addCode()
{
	if (inputImage && $('#textInput').val() != "")
	{
		$("#errorLog").text('');
		//getting the pixel data from the original image
		var img = document.getElementById('imageContainer');
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		//creating canvas in order to generate picture
		var resultCanvas = document.createElement('canvas');
		resultCanvas.width = canvas.width;
		resultCanvas.height = canvas.height;
		
		//creating drawing tools for canvas
		var ctx = resultCanvas.getContext('2d');
		var imgData = ctx.createImageData(resultCanvas.width, resultCanvas.height);
		
		//getting pixel information
		var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
	
		//getting the text information
		var secretCode = $('#textInput').val();
		
		//setting the left up most corner to inform the program about the image information
		for (var i = 0; i < 4; i++)
		{
			imgData.data[i] = 144;
		}
		
		var encodeValue = "";
		var wordLength = secretCode.length;
		//check number of digit in the length
		encodeValue += wordLength.toString().length.toString();
		encodeValue += wordLength.toString();
		
		for (var i = 0; i < wordLength; i++)
		{
			var asciiValue = secretCode.charAt(i).charCodeAt(0);
			encodeValue += asciiValue.toString().length.toString();
			encodeValue += asciiValue.toString();
		}
		
		//put the encodeValue inside the picture
		var currentIndex = 0;
		var currenti = 0;
		for (var i = 4; i < pixelData.length; i += 16)
		{
			var d1 = pixelData[i+3];
			var d2 = pixelData[i+7];
			var d3 = pixelData[i+11];
			var d4 = pixelData[i+15];
			currenti = i + 16;
			
			if (currentIndex != encodeValue.length)
			{
				d1 = 50;
				d2 = 50;
				d3 = 50;
				d4 = 50;
			
				var currentNumber = encodeValue.toString().charAt(currentIndex);
				var toBinary = dec2bin(currentNumber);
				d1 = d1 + Math.floor((toBinary / 1000) % 10) *100;
				d2 = d2 + Math.floor((toBinary / 100) % 10) *100;
				d3 = d3 + Math.floor((toBinary / 10) % 10) *100;
				d4 = d4 + Math.floor((toBinary / 1) % 10) *100;
				
				currentIndex++;
			}
			else
			{
				break;
			}
			
			for (var j = 0; j < 16; j++)
			{
				imgData.data[i+j] = pixelData[i+j];
			}
			imgData.data[i+3] = d1;
			imgData.data[i+7] = d2;
			imgData.data[i+11] = d3;
			imgData.data[i+15] = d4;
		}
		
		for (var i = currenti; i < pixelData.length; i++)
		{
			imgData.data[i] = pixelData[i];
		}
		
		ctx.putImageData(imgData, 0, 0);
		
		var outImage = resultCanvas.toDataURL("image/bmp", 1);
		
		$('#first_result').attr('src', outImage);	
	}
	else
	{
		$("#errorLog").text('Please upload an image and type a code');
	}
}

function getCode()
{
	if (inputImage)
	{
		$('#errorLog').text('');
		//getting the pixel data from the original images
		var img = document.getElementById('imageContainer');
		
		var canvas = document.createElement('canvas');
		canvas.height = img.height;
		canvas.width = img.width;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		//getting pixel information
		var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
		
		var decodeValue = "";
		var wordLength = -1;
		var currentIndex = 0;
		
		var toCheck = -1;
		var checking = "";
		var quit = false;
		if (pixelData[0] > 100)
		{
			for (var i = 4; i < pixelData.length; i += 16)
			{
				var d1 = Math.floor(pixelData[i+3] / 100);
				var d2 = Math.floor(pixelData[i+7] / 100);
				var d3 = Math.floor(pixelData[i+11] / 100);
				var d4 = Math.floor(pixelData[i+15] / 100);
				
				var asciiValue = d1 * 1000 + d2 * 100 + d3 * 10 + d4;
				var numberValue = parseInt(asciiValue, 2);
				
				if (toCheck == -1)
				{
					toCheck = numberValue;
					checking = "";
				}
				else if (toCheck != 0)
				{
					checking += numberValue.toString();
					toCheck--;
				}
				else
				{
					if (wordLength == -1)
					{
						wordLength = parseInt(checking);
						toCheck = numberValue;
						checking = "";
					}
					else if (wordLength != currentIndex)
					{
						decodeValue += String.fromCharCode(parseInt(checking));
						toCheck = numberValue;
						checking = "";
						currentIndex++;
						$("#textOutput").text("Analysing Code : " + decodeValue);
						if (wordLength == currentIndex) quit = true;
					}
				}
				
				if (quit) break;
			}
			
			$("#textOutput").text("Your Code is : " + decodeValue);
		}
		else
		{
			for (var i = 4; i < pixelData.length; i += 4)
			{
				var d1 = Math.floor(pixelData[i+0] / 100);
				var d2 = Math.floor(pixelData[i+1] / 100);
				var d3 = Math.floor(pixelData[i+2] / 100);
				var d4 = Math.floor(pixelData[i+3] / 100);
				
				var asciiValue = d1 * 1000 + d2 * 100 + d3 * 10 + d4;
				var numberValue = parseInt(asciiValue, 2);
				
				if (toCheck == -1)
				{
					toCheck = numberValue;
					checking = "";
				}
				else if (toCheck != 0)
				{
					checking += numberValue.toString();
					toCheck--;
				}
				else
				{
					if (wordLength == -1)
					{
						wordLength = parseInt(checking);
						toCheck = numberValue;
						checking = "";
					}
					else if (wordLength != currentIndex)
					{
						decodeValue += String.fromCharCode(parseInt(checking));
						toCheck = numberValue;
						checking = "";
						currentIndex++;
						$("#textOutput").text("Analysing Code : " + decodeValue);
						if (wordLength == currentIndex) quit = true;
					}
				}
				
				if (quit) break;
			}
			
			$("#textOutput").text("Your Code is : " + decodeValue);
		}
		
	}
}

function checkImage(data1, data2)
{
	if (data1.length != data2.length) return false;
	
	if (data1[0] + data1[1] + data1[2] >= 60 && data1[0] + data1[1] + data1[2] <= 75)
	{
		if (data2[0] + data2[1] + data2[2] >= 90 && data2[0] + data2[1] + data2[2] <= 100)
			return 2;
		else
			return false;
	}
	else if (data1[0] + data1[0] + data1[0] >= 90 && data1[0] + data1[1] + data1[2] <= 100)
	{
		if (data2[0] + data2[1] + data2[2] >= 60 && data2[0] + data2[1] + data2[2] <= 75)
			return 1;
		else
			return false;
	}
	return false;
}

function mergeImage()
{
	if (inputImage && input2Image)
	{
		$("#errorLog").text('');
		//getting the pixel data from the original image
		var canvasWidth;
		var canvasHeight;
		
		var img = document.getElementById('imageContainer');
		var img2 = document.getElementById('image2Container');
		
		//choose the smaller one to be the canvas size
		if (img.width > img2.width) canvasWidth = img2.width; else canvasWidth = img.width;
		if (img.height > img2.height) canvasHeight = img2.height; else canvasHeight = img.height;
		
		var canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		var canvas2 = document.createElement('canvas');
		canvas2.width = canvasWidth;
		canvas2.height = canvasHeight;
		canvas2.getContext('2d').drawImage(img2, 0, 0, img2.width, img2.height);
		
		//creating canvas in order to generate the picture
		var resultCanvas = document.createElement('canvas');
		resultCanvas.width = Math.min(img.width, img2.width);
		resultCanvas.height = Math.min(img.height, img2.height);
		var ctx = resultCanvas.getContext('2d');
		var imgData = ctx.createImageData(resultCanvas.width, resultCanvas.height);
		
		//getting pixel information 
		var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
		var pixel2Data= canvas2.getContext('2d').getImageData(0, 0, canvas2.width, canvas2.height).data;
		
		var check = checkImage(pixelData, pixel2Data);
		
		var pictureData = pixelData;
		var formatData = pixel2Data;
		
		if (check)
		{
			if (check == 1)
			{
				pictureData = pixel2Data;
				formatData = pixelData;
			}
			for (var i = 0; i < pictureData.length; i += 4)
			{
				var d1 = pictureData[i+0];
				var d2 = pictureData[i+1];
				var d3 = pictureData[i+2];
				
				var r1 = formatData[i+0];
				var r2 = formatData[i+1];
				var r3 = formatData[i+2];
				
				d1 = (d1 - r1 + 256) % 256;
				d2 = (d2 + r2 + 256) % 256;
				d3 = (d3 - r3 + 256) % 256;
				
				imgData.data[i+0] = d1;
				imgData.data[i+1] = d2;
				imgData.data[i+2] = d3;
				imgData.data[i+3] = pictureData[i+3];
			}
			
			ctx.putImageData(imgData, 0, 0);
		
			//convert to png and set it to the tag
			var outImage = resultCanvas.toDataURL("image/bmp", 1);
	
			$('#first_result').attr('src', outImage);
		}
		else{
			//normally merge the image
			 
			for (var i = 0; i < pixel2Data.length; i++)
			{
				var a1 = pictureData[i+0];
				var a2 = pictureData[i+1];
				var a3 = pictureData[i+2];
				
				var b1 = formatData[i+0];
				var b2 = formatData[i+1];
				var b3 = formatData[i+2];
				
				imgData.data[i+0] = (a1 + b1) / 2;
				imgData.data[i+1] = (a2 + b2) / 2;
				imgData.data[i+2] = (a3 + b3) / 2;
				imgData.data[i+3] = 255;
			}
			
			ctx.putImageData(imgData, 0, 0);
			
			var outImage = resultCanvas.toDataURL("image/bmp", 1);
			$('#first_result').attr('src', outImage); 
		}
	}
	else
	{
		$("#errorLog").text('Please upload two images in order to merge');
	}
}

function splitImage()
{
	if (inputImage)
	{
		$("#errorLog").text('');
		//getting the pixel data from the original image
		var img = document.getElementById('imageContainer');
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		//creating two canvases in order to generate two picture
		var resultCanvas1 = document.createElement('canvas');
		resultCanvas1.width = img.width;
		resultCanvas1.height = img.height;
		var resultCanvas2 = document.createElement('canvas');
		resultCanvas2.width = img.width;
		resultCanvas2.height = img.height;
		
		//creating drawing tools for two canvas
		var ctx = resultCanvas1.getContext('2d');
		var imgData = ctx.createImageData(resultCanvas1.width, resultCanvas1.height);
		var ctx2 = resultCanvas2.getContext('2d');
		var imgData2 = ctx2.createImageData(resultCanvas2.width, resultCanvas2.height);
		
		//getting pixel information
		var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
		
		//setting the left up most corner to inform the program about the image
		for (var i = 0; i < 4; i++)
		{
			imgData.data[i] = 23;
			imgData2.data[i] = 32;
		}
		for (var i = 4; i < pixelData.length; i += 4)
		{	
			var d1 = pixelData[i+0];
			var d2 = pixelData[i+1];
			var d3 = pixelData[i+2];
			
			var r1 = getRandomInt(255);
			var r2 = getRandomInt(255);
			var r3 = getRandomInt(255);
			
			d1 = (d1 + r1 + 256) % 256;
			d2 = (d2 - r2 + 256) % 256;
			d3 = (d3 + r3 + 256) % 256;
			
			imgData.data[i+0] = d1;
			imgData.data[i+1] = d2;
			imgData.data[i+2] = d3;
			imgData2.data[i+0] = r1; 
			imgData2.data[i+1] = r2;
			imgData2.data[i+2] = r3;
			
			imgData.data[i+3] = pixelData[i+3];
			imgData2.data[i+3] = pixelData[i+3];
		}
		ctx.putImageData(imgData, 0, 0);
		ctx2.putImageData(imgData2, 0, 0);
		
		//convert to png and set it to the tag
		var outImage1 = resultCanvas1.toDataURL("image/bmp", 1);
		var outImage2 = resultCanvas2.toDataURL("image/bmp", 1);
	
		$('#first_result').attr('src', outImage1);
		$('#second_result').attr('src', outImage2);
	}
	else
	{
		$("#errorLog").text('Please upload an image first');
	}
}