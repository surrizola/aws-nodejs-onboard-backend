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


var bucket_name = "faces-onboarding-bucket-fluxit"

// en la faces-onboarding-collection-1 ya estan indexados todos los fluxers
var col_name = "faces-onboarding-collection-1"

//https://s3.amazonaws.com/faces-onboarding-bucket-fluxit/santiago-urrizola.jpg

var imag_base_urls = "https://s3.amazonaws.com/"+bucket_name

var myFunc1 = function() { return "aaa" };
var myFunc2 = function() { return "bbbb" };
exports.myFunc1 = myFunc1;
exports.myFunc2 = myFunc2;





var get_faces=function(callback, errorCallback){
	 var params = {
	  CollectionId: col_name, 
	  MaxResults: 200
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

var delete_face=function(faceId, callback, errorCallback){

		var params = {
		  CollectionId: col_name, 
		  FaceIds: [faceId]
		 };
		 rekognition.deleteFaces(params, function(err, data) {
		   if (err) {
		   	console.log('error api')
		   	if (errorCallback){errorCallback(err)}
		   		//console.log(err, err.stack); 

		   }
		   else {
		   	console.log('ok api')
		   	if (callback){callback(data)}
		   	     //console.log(data); 
		   }
		    });

}



var  index_from_base64 = function(image_base64,username,  callback, errorCallback){
	console.log('START INDEX FOR USER '+username)
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
		  	console.log('***** OK INDEX ****** ['+username+']')
		  	//console.log(data);           
		  	if (callback){
		  		callback(data)
		  	}
		  }
		});


}


var store_ins3_foruser_frombase64= function(base64 , username, callback, errorcallback){
// Read in the file, convert it to base64, store to S3

		//console.log(imageFile)

		//var fn =path.basename(imageFile)
		var fn = username+'.jpg'
		//fs.readFile(imageFile, function (err, data) {
		  //if (err) { throw err; }

		 var base64data = new Buffer(base64, 'binary');

		 var params = {
		  Body: base64data, 
		  Bucket: bucket_name, 
		  ACL: "public-read",
		  Key: fn, 
		  Tagging: "username="+username
		 };

		  //var s3 = new AWS.S3();
		  s3.putObject(params,function (error, resp) {
		  	 if (error) {
		  		console.log(error, error.stack); 
		  		if (errorcallback){errorcallback(error)}
		  	}else {
		  		console.log ('PUT OK FOR '+username)
		  		callback(resp)
		  		//console.log(arguments);
		    	//console.log('error .'+error + '  RESP '+resp);	
		  	}
		    
		  });

		//});
}



var  detect_from_base64 = function(image_base64_1, callback, errorCallback){

	var image_base64_1_binary = new Buffer(image_base64_1, 'binary');
	//var image_base64_2_binary = new Buffer(image_base64_2, 'binary'); 		
 	console.log('START DETECT FACE')
 		//console.log(errorCallback)
	 var params = {	  
	  	Image: { Bytes: image_base64_1_binary}, 
  		Attributes: [ 'DEFAULT' , 'ALL']
	 };

		rekognition.detectFaces(params, function(err, data) {
		  if (err) {
		  	console.log('** DETECT ERROR *** '+err.message)
			//errorCallback(err);
			errorCallback({message: err.message})
		  }
		  else{
				console.log('***** DETECT END ****** ')
				if (data.FaceDetails.length > 0){
					
					face = data.FaceDetails[0]
					callback(face)
				}else {
					console.log('no hay detect')	
					if (errorCallback){
						errorCallback({message: 'no hay caras en la foto'})
					}
					
				}
			}
		});
}



var onboad_complete = function(image_base64_dni,image_base64_selfie, callback, errorCallback){

	this.compare_from_base64(image_base64_dni, image_base64_selfie,
		function(face){
				console.log('ONBOARD STEP 1 COMPLETE ')
				//console.log(face)
				console.log(' SIMILARITY : '+face.Similarity); 
				console.log(' Confidence '+face.Face.Confidence)
				face_detect = {	'check':'True',
							'similarity': face.Similarity,
							'confidence': face.Face.Confidence,
							'Face':face
						}
				console.log(face_detect)
				face.Face.Landmarks.forEach(function(l){
					console.log(l.Type);
				});
				
				detect_from_base64(image_base64_selfie ,
					function(faceDetail){
						face_detect['FaceDetail'] = faceDetail;
						console.log('********* ONBOARD FINISH ******* !!')
						/*
						if (face.Face.ExternalImageId != id){
							console.log('indexando usuario')
							awsreco.index_from_base64(base64PureDni, id, function(data){}, function(error){})
						}
						*/
						
						callback(face_detect);
					}
				
				 , errorCallback);


				
				



		},
		function(error){
			console.log('IDENTIFY ERROR ');
			errorCallback( error)
			//sendErrorMessage(res, error.message)
		}

	);
}



var  compare_from_base64 = function(image_base64_1,image_base64_2, callback, errorCallback){

	var image_base64_1_binary = new Buffer(image_base64_1, 'binary');
	var image_base64_2_binary = new Buffer(image_base64_2, 'binary'); 		
 	console.log('START COMPARE')
 		//console.log(errorCallback)
	 var params = {
	  SimilarityThreshold: 65, 
	  SourceImage: { Bytes: image_base64_1_binary}, 
	  TargetImage: { Bytes: image_base64_2_binary}
	 };

		rekognition.compareFaces(params, function(err, data) {
		  if (err) {
		  	console.log('** COMPARE ERROR *** '+err.message)
			//errorCallback(err);
			errorCallback({message: 'Las fotos que nos enviaste no pertenecen a la misma persona'})
		  }
		  else{
				console.log('***** COMPARE END ****** ')
				if (data.FaceMatches.length > 0){
					face = data.FaceMatches[0]
					callback(face)
				}else {
					console.log('no hay comparacion')	
					if (errorCallback){
						errorCallback({message: 'Las fotos que nos enviaste no pertenecen a la misma persona'})
					}
					
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





//exports.test_compare= test_compare;

exports.identify_from_base64 = identify_from_base64;

exports.compare_from_base64 = compare_from_base64;

exports.index_from_base64 = index_from_base64;

exports.detect_from_base64 = detect_from_base64
exports.onboad_complete = onboad_complete 
exports.store_ins3_foruser_frombase64 = store_ins3_foruser_frombase64

exports.get_faces = get_faces
exports.delete_face = delete_face

exports.rekognition = rekognition
exports.s3 = s3
exports.col_name = col_name
exports.imag_base_urls = imag_base_urls