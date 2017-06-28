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




//exports.test_compare= test_compare;

exports.identify_from_base64 = identify_from_base64;

exports.compare_from_base64 = compare_from_base64;

exports.index_from_base64 = index_from_base64;


exports.get_faces = get_faces
exports.delete_face = delete_face

exports.rekognition = rekognition
exports.s3 = s3
exports.col_name = col_name