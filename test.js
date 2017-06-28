var     fs = require('fs');
var awsreco = require('./sample');




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
var data1 = "data:image/jpg;base64,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"




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


test_get_faces();

