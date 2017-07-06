var     fs = require('fs');
var awsreco = require('./sample');





//dir_fluxers = '/home/chily/Documents/photos/Fluxers-Fotos'

//dir_fluxers = '/home/chily/Documents/photos/Fluxers-Fotos/LOTE 1'
dir_fluxers = '/home/chily/Desktop/test'
function index_face(filepath ,name,  stat){

	fs.readFile(filepath, function (err, data) {
		  	if (err) { throw err; }

		  	var base64data = new Buffer(data, 'binary');

		  	var user_name = name.replace('-byn.jpg', '');
		  	var user_name = user_name.replace('-byn2.jpg', '');
		  	//console.log('read '+filepath +  '  USERNAME['  + user_name + ']')
		  	console.log('  USERNAME['  + user_name + '] '+filepath)


			awsreco.index_from_base64(base64data,  user_name,
		  						function(ok){
		  							console.log('INDEX OK FOR '+user_name )
									awsreco.store_ins3_foruser_frombase64(base64data, user_name, console.log , console.error);


		  						},
		  						function(error){
		  							console.log('INDEX ERROR FOR '+user_name)
		  							console.error(error.message)
		  						}
		  						);
		  	
			
		});	
}

// sync version
function walkSync(currentDirPath, callback) {
    var fs = require('fs'),
        path = require('path');
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, name, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}


//files = runOverFiles(dir_fluxers, processFile)

walkSync(dir_fluxers, index_face)


//console.log(files)

