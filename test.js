var     fs = require('fs');
var awsreco = require('./sample');





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
	  //response.test = matches[0];
	  response.type = matches[1];
	  response.data = new Buffer(matches[2], 'base64');

	  	console.log('**** ORIGINAL ***')
//console.log(dataString);

console.log('**** MODIFIY ***')
//console.log(response.data);
	  return response;
	}

function saveToDisk(fullBase64){
	//var data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';
	var data = fullBase64;
	var imageBuffer = decodeBase64Image(data);
	//console.log(imageBuffer);
	fs.writeFile('/tmp/test.jpg', imageBuffer.data, function(err) { console.log('error '+err) });



}
var data1 = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCABgADYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDT0u5S5t+wlXqKvCuPtbloZVkQkEehrq7G4F1biQYz0P1rOEr6FVIW1JwKcBTgKcFqzMbijFSBaXbQMi20VNtooA80STB4rV0rUmtZxkkxtwwrJhjzjvV+CLFc+x1vVanaSTxQ27TyuFiVdxY+lche+NbhpSLOKNIweC4yW/wrU8YtImjW8EfWZwv4YrCs9It0jHmAu2OTXRexzRjcvaZ4ymaYLexo0Z7oMMP15rs7eWO4hWWFw6MMgiuBfRIMgxllNbXhiaSy1BtOlbcki74z70rpjlBpHU7aKkC0UyDzqN0uTmQhJezdA31/xqzDERMI2BUkgc1ixO3YGtjS5nkuYY5ULjcApzyvP8qwOt7Gj4zidbjTZNpMa7wT74GP5GsOO/fzVTCc9QM5FdT4yjbFlJgmNWIP1P8Ak1gNDGqmTaB3rVmcFoJeXUtuygbQGGc4Jq/a7jf6bNhS5cqzL6cf4moVeGeFR1YcjI6CtO0gV40znhwxI7Ac/wBKSHJXR0woql9tHbmirOc4CC0kbGNvPvWnoqZ1O3B5G8U2Bbe3iGYntV7EnfH+fWruiWkv9owyja8QO7ehyKyaXQ6OZ2dzqtQsor+0eGVAxxlc9j2rz6VpQTF0ZSVYHggivSDKiJukdVX1JxXnWuSRf21cy23zQu2fxxyfzzWjM6dyK3LbiFOPqeK1Y75bPTfNmMgBcLlMZPBPf6VkW94N+CuR2GKvTSRz2Eizr8oYMoBxg9P60LzLactEdDpMrX8LP9mli2kY8xcbh6iiorDxRAlrHHNE4aNQuV5ziimR7Ka6HDwvdbvs0fDSJkqOARWxpEV3pbtIkQaQoQAX4NU5bG5lZZ4igKqAuDg46/1qruvvtDAeb5o54zUNm1OmmtzXuRq1+d1xKFVTlUzx+QqkwJcq4ww6g0z+2LsAZK++VqKa+edwzIgb+8KWhsoTe6RaRQpq1CgnkBchYIzlie59KzlmYgfLTzM7kIPujsKpIlxaOhjay27f3RGc44orEj3nojH6CitDHk8yCO9v1GI4C6fwnYelKdUkSQGeDYw4zgjioFuL1+VfYPTgUPcXiqwmxKhHIIzWNzVQVtkbMltBOuJEGCc5HBqNtKtQMDcPfNYEd5Og+SVgOmM5q7FrM4GHVWqrojkqR2Zprplsg5LN+NTW6JEPkGO1Y0urzOhCqq+4qD7XOx5lb8DiqTQvZzl8TOn30VzPnSN1dj9TRTuT7HzP/9k="




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



//saveToDisk(data1);	
//test_index()


// test_get_faces();
//delete_collection(awsreco.col_name)
//init_collection(awsreco.col_name)
console.log(test_get_faces());



