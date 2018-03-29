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
	console.log("uploaded");
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
	return true;
	if (data1.length != data2.length) return false;
	console.log(data1[0])
	console.log(data1[1])
	console.log(data1[2])
	if (data1[0] == 123 && data1[1] == 123 && data1[2] == 123)
	{
		if (data2[0] == 321 && data2[1] == 321 && data2[2] == 321)
			return 2;
		else
			return false;
	}
	else if (data1[0] == 321 && data1[1] == 321 && data1[2] == 321)
	{
		if (data2[0] == 123 && data2[1] == 123 && data2[2] == 123)
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
		var img = document.getElementById('imageContainer');
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		var img2 = document.getElementById('image2Container');
		var canvas2 = document.createElement('canvas');
		canvas2.width = img2.width;
		canvas2.height = img2.height;
		canvas2.getContext('2d').drawImage(img2, 0, 0, img2.width, img2.height);
		
		//creating canvas in order to generate the picture
		var resultCanvas = document.createElement('canvas');
		resultCanvas.width = Math.max(img.width, img2.width);
		resultCanvas.height = Math.max(img.height, img2.height);
		var ctx = resultCanvas.getContext('2d');
		var imgData = ctx.createImageData(resultCanvas.width, resultCanvas.height);
		
		//getting pixel information 
		var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
		var pixel2Data= canvas2.getContext('2d').getImageData(0, 0, canvas2.width, canvas2.height).data;
		
		var check = checkImage(pixelData, pixel2Data);
		console.log(check);
		
		var pictureData = pixelData;
		var formatData = pixel2Data;
		
		if (check)
		{
			for (var i = 0; i < pictureData.length; i += 4)
			{
				var d1 = pictureData[i+0];
				var d2 = pictureData[i+1];
				var d3 = pictureData[i+2];
				
				var invert = formatData[i+2] / 100;
				if (invert == 0) d1 = 255 - d1;
				else if (invert == 1) d2 = 255 - d2;
				else d3 = 255 - d2;
				
				var temp;
				var swipe = formatData[i+1] / 100;
				if (swipe == 0) { temp = d2; d2 = d3; d3 = temp; }
				else if (swipe == 1) { temp = d1; d1 = d3; d3 = temp; }
				else { temp = d1; d1 = d2; d2 = temp; }
				
				var multiply = formatData[i+0] / 100;
				d1 = d1 * multiply;
				d2 = d2 * multiply;
				d3 = d3 * multiply;
				
				imgData.data[i+0] = d1;
				imgData.data[i+1] = d2;
				imgData.data[i+2] = d3;
				imgData.data[i+3] = 255;
			}
			
			ctx.putImageData(imgData, 0, 0);
		
			//convert to png and set it to the tag
			var outImage = resultCanvas.toDataURL("image/jpg");
	
			$('#first_result').attr('src', outImage);
		}
		else{}
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
			imgData.data[i] = 123;
			imgData2.data[i] = 321;
		}
		for (var i = 4; i < pixelData.length; i += 4)
		{	
			//imgData2[0] will decide number to divide
			//imgData2[1] will decide which number to swipe
			//imgData2[2] will finally decide which number to invert
			var divide = getRandomInt(3);
			var swipe = getRandomInt(3);
			var invert = getRandomInt(3);
			
			var d1 = pixelData[i+0] / divide;
			var d2 = pixelData[i+1] / divide;
			var d3 = pixelData[i+2] / divide;
			
			var temp;
			if (swipe == 0) { temp = d2; d2 = d3; d3 = temp; }
			else if (swipe == 1) { temp = d1; d1 = d3; d3 = temp; }
			else { temp = d1; d1 = d2; d2 = temp; }
			
			if (invert == 0) d1 = 255 - d1;
			else if (invert == 1) d2 = 255 - d2;
			else if (invert == 2) d3 = 255 - d3;
			
			imgData.data[i+0] = d1;
			imgData.data[i+1] = d2;
			imgData.data[i+2] = d3;
			imgData2.data[i+0] = divide * 100 + getRandomInt(100);
			imgData2.data[i+1] = swipe * 100 + getRandomInt(100);
			imgData2.data[i+2] = invert * 100 + getRandomInt(100);
			
			imgData.data[i+3] = 255;
			imgData2.data[i+3] = 255;
		}
		ctx.putImageData(imgData, 0, 0);
		ctx2.putImageData(imgData2, 0, 0);
		
		//convert to png and set it to the tag
		var outImage1 = resultCanvas1.toDataURL("image/jpg");
		var outImage2 = resultCanvas2.toDataURL("image/jpg");
	
		$('#first_result').attr('src', outImage1);
		$('#second_result').attr('src', outImage2);
	}
	else
	{
		$("#errorLog").text('Please upload an image first');
	}
}