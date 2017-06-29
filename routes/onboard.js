var express = require('express');
var fs      = require('fs');
var awsreco = require('../sample');

var router = express.Router();

router.post('/testcall', function(req, res, next) {

body = req.body;

console.log(req.body);
console.log(req.body.image);
  res.json({'test ':'test'});
});



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
console.log(dataString);

console.log('**** MODIFIY ***')
console.log(response.data);
	  return response;
	}

function saveToDisk(fullBase64){
	//var data = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAA..kJggg==';
	var data = fullBase64;
	var imageBuffer = decodeBase64Image(data);
	console.log(imageBuffer);
	fs.writeFile('test.jpg', imageBuffer.data, function(err) { console.log(err) });



}

router.post('/identify/v1', function(req, res, next) {
	console.log('IDENTIFY API CALL');
	base64Pure = decodeBase64Image(req.body.selfie).data;
	awsreco.identify_from_base64(base64Pure, 
		function(face){
				console.log('IS FACE PRESENT')
				console.log(face)
				console.log(' USER '+face.Face.ExternalImageId)
				console.log(' SIMILARITY : '+face.Similarity); 
				console.log(' FACE ID '+face.Face.FaceId)
				console.log(' IMAGE ID '+face.Face.ImageId)
				console.log(' Confidence '+face.Face.Confidence)
				image_url = awsreco.imag_base_urls+ '/'+face.Face.ExternalImageId+ '.jpg'
				console.log('URL  '+image_url)
				face_detect = {	'check':'True',
							'name': face.Face.ExternalImageId,	
							'faceId':face.Face.FaceId,
							'similarity': face.Similarity,
							'confidence': face.Face.Confidence,
							'image_url': image_url
						}
				console.log(face_detect)
				res.json(face_detect);			
		},
		function(error){
			console.log('IDENTIFY ERROR ');
			sendErrorMessage(res, error.message)
		}

	);

  	
});

router.post('/faces/v1', function(req, res, next) {
	console.log('faces')
	awsreco.get_faces(
			function(data){
				res.json(data);			
			},
			function(error){
					res.status(500);
					res.json(error);					
					//sendErrorMessage(res,  error.message)
			}
			)
	
});

router.post('/deleteface/v1', function(req, res, next) {
	faceId = req.body.faceId
	console.log('delete face '+faceId)
	awsreco.delete_face(
		faceId,
			function(data){
				console.log('ok')
				res.json(data)	
			},
			function(error){
					console.log('error')
					res.status(500);
					res.json(error);										
				}
			)
	
});



router.post('/validate/v1', function(req, res, next) {
	userName = req.body.name
	console.log('VALIDATE API CALL '+userName);
	base64Pure = decodeBase64Image(req.body.selfie).data;
	
	awsreco.identify_from_base64(base64Pure, 
		function(face){
				nameDetection = face.Face.ExternalImageId
				console.log('LA CARA EXISTE PARA '+ nameDetection)
				
				if (nameDetection ==  userName){
					console.log(' USER '+face.Face.ExternalImageId)
					console.log(' SIMILARITY : '+face.Similarity); 
					console.log(' FACE ID '+face.Face.FaceId)
					console.log(' IMAGE ID '+face.Face.ImageId)
					console.log(' Confidence '+face.Face.Confidence)
					face_detect = {	'check':'True',
								'name': face.Face.ExternalImageId,	
								'faceId':face.Face.FaceId,
								'similarity': face.Similarity, 
								'confidence': face.Face.Confidence,
								'image_url': awsreco.imag_base_urls+ '/'+face.Face.ExternalImageId+ '.jpg'

							}
					console.log(face_detect)
					res.json(face_detect);								
				}else {
					console.log('CARA NO CORRESPONDE AL USUARIO ');
					sendErrorMessage(res,  'La cara existe pero es de otro usuario ['+nameDetection+ ']')
				}
		},
		function(error){
			console.log('IDENTIFY ERROR ');
			sendErrorMessage(res, error.message)
		}

	);

  	
});


function compareOk(res , face){


}


router.post('/onboard/v1', function(req, res, next) {
	
	name = req.body.name
	console.log('ONBOARD API CALL '+name);
	base64PureDni = decodeBase64Image(req.body.dni).data;
	base64PureSelfie = decodeBase64Image(req.body.selfie).data;
	

	awsreco.compare_from_base64(base64PureDni, base64PureSelfie,
		function(face){
				console.log('IS FACE PRESENT '+face.Face.ExternalImageId)
				console.log(face)
				console.log(' USER '+face.Face.ExternalImageId)
				console.log(' SIMILARITY : '+face.Similarity); 
				console.log(' FACE ID '+face.Face.FaceId)
				console.log(' IMAGE ID '+face.Face.ImageId)
				console.log(' Confidence '+face.Face.Confidence)
				face_detect = {	'check':'True',
							'name': face.Face.ExternalImageId,	
							'faceId':face.Face.FaceId,
							'similarity': face.Similarity,
							'confidence': face.Face.Confidence
						}
				console.log(face_detect)

				if (face.Face.ExternalImageId != name){
					console.log('indexando usuario')
					awsreco.index_from_base64(base64PureDni, name, function(data){}, function(error){})
				}
				

				res.json(face_detect);



		},
		function(error){
			console.log('IDENTIFY ERROR ');
			sendErrorMessage(res, error.message)
		}

	);

  	
});



function sendErrorMessage(res, message){
		error = {
			'check': 'False',
			'message': message
		}
		res.json(error)
}

module.exports = router;
