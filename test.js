var     fs = require('fs');
var awsreco = require('./sample');
var path = require('path');






function test_identity(file){


		fs.readFile(file, function (err, data) {
		  	if (err) { throw err; }

		  	var base64data = new Buffer(data, 'binary');

		  	awsreco.identify_from_base64(base64data, 
		  						function(ok){

		  								console.log(ok)

		  						},
		  						function(error){
		  							console.log(error.message)
		  						}
		  						);
		  

		});


}



function index_from_s3(s3name ,user_name){

			var params = {
		  CollectionId: col_name,
		  Image: { /* required */
		    S3Object: {
			    Bucket: bucket_name, 
			    Name: s3name
			   }
		  },
		   ExternalImageId: user_name, 
		  DetectionAttributes: []
		  
		};
		rekognition.indexFaces(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else     {
		  	console.log('***** OK INDEX ****** ')
		  	console.log(data);           
		  }
		});
}

function compare_faces_from_s3(s3_image1, s3_image2, callback){


	 var params = {
	  SimilarityThreshold: 75, 
	  SourceImage: {
	   S3Object: {
	    Bucket: bucket_name, 
	    Name: s3_image1
	   }
	  }, 
	  TargetImage: {
	   S3Object: {
	    Bucket: bucket_name, 
	    Name: s3_image2
	   }
	  }
	 };

	rekognition.compareFaces(params, function (err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     {
			console.log('***** COMPARE  ****** ')
	 			 console.log(data);
				if (data.FaceMatches.length > 0){
						face = data.FaceMatches[0]
						callback(face)
		  			}else {
		  				console.log('no se detecto ninguno')	
		  				callback(null)
		  			}	 			 
			}
	});

}


function upload_from_file(imageFile, id_user){
// Read in the file, convert it to base64, store to S3

		//console.log(imageFile)

		var fn =path.basename(imageFile)

		fs.readFile(imageFile, function (err, data) {
		  if (err) { throw err; }

		 	awsreco.store_ins3_foruser_frombase64(data, id_user, console.log , console.error);

		});
}




function init_collection(name){

	/* This operation creates a Rekognition collection for storing image data. */

 var params = {
  CollectionId: name
 };
 awsreco.rekognition.createCollection(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   
 });
}




function delete_collection(name){

	/* This operation creates a Rekognition collection for storing image data. */

 var params = {
  CollectionId: name
 };
 awsreco.rekognition.deleteCollection(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   
 });
}

function test_get_faces(){
	awsreco.get_faces(function(data1){console.log(data1);    })


}

function decodeBase64Image(dataString) {
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	var response = {};
	if (matches.length !== 3) {
	    return new Error('Invalid input string');
	}
	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');
	return response;
}


function saveToDisk(fullBase64){
	//var data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';
	var data = fullBase64;
	var imageBuffer = decodeBase64Image(data);
	//console.log(imageBuffer);
	fs.writeFile('/tmp/test.jpg', imageBuffer.data, function(err) { console.log('error '+err) });
}



function test_index(){
	fs.readFile('images/surrizola1.jpg', function (err, data) {
		  	if (err) { throw err; }
		  	var base64data = new Buffer(data, 'binary');
			awsreco.index_from_base64(base64data,  'chily',
		  						function(ok){
		  							console.log('ok')
		  						},
		  						function(error){
		  							console.log(error.message)
		  						}
		  						);
		  

		});



}


var fs = require("fs");

function test_compare_faces(file1, file2){
	f1 = '/home/chily/Desktop/images/dni.jpg'
	//f1 = '/home/chily/Desktop/images/surrizola2.jpg'
	//f2 =  '/home/chily/Desktop/images/dni-1.resized.jpg'
	f2 =  '/home/chily/Desktop/images/foto_from_dni.jpg'
	//f2 =  '/home/chily/Desktop/images/surrizola1.jpg'

	var buf = fs.readFileSync(f1);
	var base64f1 = new Buffer( buf, 'binary');

	var buf2 = fs.readFileSync(f2);
	var base64f2 = new Buffer( buf2, 'binary');

	awsreco.compare_from_base64(base64f1, base64f2, console.log, function(error){console.error('error = '+error.message)});

	//awsreco.decodeBase64Image('')
	//nodeawsreco.compare_from_base64()

}


function test_onboard(file1, file2){
	f1 = '/home/chily/Desktop/images/dni.jpg'
	//f1 = '/home/chily/Desktop/images/surrizola2.jpg'
	//f2 =  '/home/chily/Desktop/images/dni-1.resized.jpg'
	f2 =  '/home/chily/Desktop/images/foto_from_dni.jpg'
	//f2 =  '/home/chily/Desktop/images/surrizola1.jpg'

	var buf = fs.readFileSync(f1);
	var base64f1 = new Buffer( buf, 'binary');

	var buf2 = fs.readFileSync(f2);
	var base64f2 = new Buffer( buf2, 'binary');

	awsreco.onboad_complete(base64f1, base64f2, console.log, function(error){console.error('error = '+error.message)});

	//awsreco.decodeBase64Image('')
	//nodeawsreco.compare_from_base64()

}


function test_dect(file1){
	//f1 = '/home/chily/Desktop/images/dni.jpg'
	//f1 = '/home/chily/Desktop/images/surrizola2.jpg'
	//f2 =  '/home/chily/Desktop/images/dni-1.resized.jpg'
	//f2 =  '/home/chily/Desktop/images/foto_from_dni.jpg'
	//f2 =  '/home/chily/Desktop/images/surrizola1.jpg'
	f1 = '/home/chily/Desktop/images/bllink_eye.jpg'
	var buf = fs.readFileSync(f1);
	var base64f1 = new Buffer( buf, 'binary');

	
	awsreco.detect_from_base64(base64f1, console.log, function(error){console.error('error = '+error.message)});

	//awsreco.decodeBase64Image('')
	//nodeawsreco.compare_from_base64()

}




//test_compare_faces()
//test_dect()
test_onboard()
//saveToDisk(data1);	
//test_index()


// test_get_faces();
//delete_collection(awsreco.col_name)
//init_collection(awsreco.col_name)
//console.log(test_get_faces());

//upload_from_file('/home/chily/Documents/photos/Fluxers-Fotos/LOTE 6/santiago-urrizola-byn.jpg', 'chily');

//test_identity('/home/chily/Desktop/test/santiago-urrizola-byn.jpg')

