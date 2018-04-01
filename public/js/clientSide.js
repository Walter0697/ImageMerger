var inputImage = null;
var input2Image = null;

var split = true;

$(document).ready(function(){
	$('.allImage').attr('src', "assets/picture.png");
	$(".merge").hide();
	split = true;
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

function toMerge()
{
	inputImage = null;
	input2Image = null;
	$('.allImage').attr('src', "assets/picture.png");
	split = false;
	$(".merge").show();
	$(".split").hide();
}

function toSplit()
{
	inputImage = null;
	input2Image = null;
	$('.allImage').attr('src', "assets/picture.png");
	split = true;
	$(".split").show();
	$(".merge").hide();
}

function getRandomInt(number)
{
	return Math.floor(Math.random() * Math.floor(number));
}

function analysisImage()
{
	if (split)
		splitImage();
	else 
		mergeImage();
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
				imgData.data[i+3] = pictureData[i+3];
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
		
		//creating two canvas in order to generate two picture
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