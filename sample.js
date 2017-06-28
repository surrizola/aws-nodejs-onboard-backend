/*
	// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#compareFaces-property

**/

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var     fs = require('fs');
var path = require('path');

AWS.config.update(
	{
 		accessKeyId: "AKIAJ7R4CYWZT252DFVQ",
    	secretAccessKey: "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",
		region:'us-east-1'}
	);

// Create an S3 client
var s3 = new AWS.S3();
	var rekognition = new AWS.Rekognition();

// Create a bucket and upload something into it
//var bucketName = 'node-sdk-sample-' + uuid.v4();

var bucket_name = "faces-onboarding-bucket-fluxit"

var col_name = "faces-onboarding-collection-1"


var myFunc1 = function() { return "aaa" };
var myFunc2 = function() { return "bbbb" };
exports.myFunc1 = myFunc1;
exports.myFunc2 = myFunc2;



function upload_know_from_file(imageFile, id_user){
// Read in the file, convert it to base64, store to S3

		//console.log(imageFile)

		var fn =path.basename(imageFile)

		fs.readFile(imageFile, function (err, data) {
		  if (err) { throw err; }

		  var base64data = new Buffer(data, 'binary');

		 var params = {
		  Body: base64data, 
		  Bucket: bucket_name, 
		  Key: fn, 
		  Tagging: "id_user="+id_user
		 };

		  //var s3 = new AWS.S3();
		  s3.putObject(params,function (resp) {
		    console.log(arguments);
		    console.log('Successfully uploaded package.');
		  });

		});
}

function initCollection(){

	/* This operation creates a Rekognition collection for storing image data. */

 var params = {
  CollectionId: col_name
 };
 rekognition.createCollection(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   
 });
}



var get_faces=function(callback, errorCallback){

	 var params = {
	  CollectionId: col_name, 
	  MaxResults: 50
	 };
	 rekognition.listFaces(params, function(err, data) {
	   	if (err) {
	   		console.log(err, err.stack);
	   		 if (errorCallback){errorCallback(err)}
	   	}
	   	else     {
	   		//console.log(data);    
	   		if (callback){callback(data)}
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
						//console.log(data.FaceMatches); 
						face = data.FaceMatches[0]
						//console.log(face); 

						//console.log('USER '+face.Face.ExternalImageId)
						//console.log(' SIMILARITY : '+face.Similarity); 
						//console.log(' FACE ID '+face.Face.FaceId)
						//console.log(' IMAGE ID '+face.Face.ImageId)
						//console.log(' Confidence '+face.Face.Confidence)

						callback(face)
		  			}else {
		  				console.log('no se detecto ninguno')	
		  				callback(null)
		  			}	 			 
			}
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



function identify_from_file(imageFile, name, callback, errorCallback){
	
	fs.readFile(imageFile, function (err, data) {
 		 if (err) { throw err; }

		var base64data = new Buffer(data, 'binary');

		var params = {
		  CollectionId: col_name,	
		  Image: { /* required */
		    Bytes: base64data    
		  },
		  FaceMatchThreshold: 75,
		  MaxFaces: 10
		};

		rekognition.searchFacesByImage(params, function(err, data) {
		  if (err) {
		  		console.log( ' **** IDENTIFY ERROR ******')
		  		console.log(err, err.stack); 
		  		errorCallback({error:err});
		  }
		  else     {
		  			console.log('***** IDENTIFY END ****** '+imageFile)
		  			if (data.FaceMatches.length > 0){
		  				console.log('DETECCION EXITOSA')
						//console.log(data.FaceMatches); 
						face = data.FaceMatches[0]
						//console.log(face); 

						//console.log('USER '+face.Face.ExternalImageId)
						//console.log(' SIMILARITY : '+face.Similarity); 
						//console.log(' FACE ID '+face.Face.FaceId)
						//console.log(' IMAGE ID '+face.Face.ImageId)
						//console.log(' Confidence '+face.Face.Confidence)

						callback(face)
		  			} else {
		  				console.log(' *** IDENTIFY NO HAY CARACAS **** ')	
		  				callback(null)
		  			}

			}
		}, function(a, b){

			console.log('test d error')
		});

	});


}



var  index_from_base64 = function(image_base64,username,  callback, errorCallback){
	var image_base64_binary = new Buffer(image_base64, 'binary');
		var params = {
		  CollectionId: col_name,
		  Image:{ Bytes: image_base64_binary}, 
		  ExternalImageId: username, 
		  DetectionAttributes: []
		  
		};
		rekognition.indexFaces(params, function(err, data) {
		  if (err) {
		  	console.log(err, err.stack); 
		  	if (errorCallback){errorCallback(err)}
		  }
		  else {
		  	console.log('***** OK INDEX ****** ')
		  	console.log(data);           
		  	if (callback){
		  		callback(data)
		  	}
		  }
		});


}




var  compare_from_base64 = function(image_base64_1,image_base64_2, callback, errorCallback){
	
	
	var image_base64_1_binary = new Buffer(image_base64_1, 'binary');
	var image_base64_2_binary = new Buffer(image_base64_2, 'binary'); 		
 		console.log('START COMPARE')
 		console.log(errorCallback)
	 var params = {
	  SimilarityThreshold: 75, 
	  SourceImage: { Bytes: image_base64_1_binary}, 
	  TargetImage: { Bytes: image_base64_2_binary}
	 };

	 console

		rekognition.compareFaces(params, function(err, data) {
		  if (err) {
		  		console.log('** COMPARE ERROR *** ')
		  		
		  		errorCallback(err);
		  }
		  else     {
		  			console.log('***** COMPARE END ****** ')
		  			if (data.FaceMatches.length > 0){
						face = data.FaceMatches[0]
						callback(face)
		  			}else {
		  				console.log('no hay comparacion')	
		  				errorCallback({message: 'Las fotos que nos enviaste no pertenecen a la misma persona'})
		  			}


					}
		});


}





var  identify_from_base64 = function(base64, callback, errorCallback){
	
	
 		var base64data = new Buffer(base64, 'binary');

		var params = {
		  CollectionId: col_name,	
		  Image: { /* required */
		    Bytes: base64data    
		  },
		  FaceMatchThreshold: 75,
		  MaxFaces: 10
		};

		rekognition.searchFacesByImage(params, function(err, data) {
		  if (err) {
		  		console.log('** IDENTIFY ERRO *** ')
		  		console.log(err)
		  		errorCallback(err)
		  }
		  else     {
		  			console.log('***** IDENTIFY END ****** ')
		  			if (data.FaceMatches.length > 0){
						face = data.FaceMatches[0]
						callback(face)
		  			}else {
		  				console.log('no se detecto ninguno')	
		  				errorCallback({message: 'No detectamos tu cara en nuestros registros'})
		  			}


					}
		});


}


var test_compare = function(){
 return new Promise(function (resolve, reject) {
	
	compare_faces_from_s3('chily0.jpg', 'chily1.jpg', 
				function(face){
								console.log('IMG  USER '+face.Face.ExternalImageId + ' SIMILARITY '+face.Similarity)
								resolve(face)
				});	
	});
}

function test_identity(){

		//compare_faces( 'surrizola1.jpg','surrizola2.jpg')

/*
		identify_from_file('images_knows/chily0.jpg', function(face){
								console.log('IMG  USER '+face.Face.ExternalImageId + ' SIMILARITY '+face.Similarity)
		});



		identify_from_file('images_knows/biden.jpg', function(face){
								if (face){
									console.log('IMG  USER '+face.Face.ExternalImageId + ' SIMILARITY '+face.Similarity)
								}else {
									console.log( 'no se detecto')
								}
								
		});
*/

		fs.readFile('images_knows/27861335112_fc13951d18_o.jpg', function (err, data) {
		  	if (err) { throw err; }

		  	var base64data = new Buffer(data, 'binary');

		  	identify_from_base64(base64data, 
		  						function(ok){},
		  						function(error){
		  							console.log(error.message)
		  						}
		  						);
		  

		});


/*
		identify_from_file('images_knows/27861335112_fc13951d18_o.jpg', function(face){
								if (face){
									console.log('IMG  USER '+face.Face.ExternalImageId + ' SIMILARITY '+face.Similarity)
								}else {
									console.log( 'no se detecto')
								}
								
		});

*/
}




//test_identity()
//initCollection()

//upload_know_from_file('images_knows/chily0.jpg', 'chily')
//upload_know_from_file('images_knows/chily1.jpg', 'chily')
//index_from_s3('chily0.jpg',  'chily')
//index_from_s3('chily1.jpg', 'chily')


//test_compare();



exports.test_compare= test_compare;

exports.identify_from_base64 = identify_from_base64;

exports.compare_from_base64 = compare_from_base64;

exports.index_from_base64 = index_from_base64;


exports.get_faces = get_faces