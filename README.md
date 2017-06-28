


## Install
   install dependencies:
     $ cd . && npm install

   run the app:
     $ DEBUG=aws-nodejs-sample:* npm start



## AWS CONFIG

(C:\Users\USER_NAME\.aws\ for Windows users)

    [default]
    aws_access_key_id = <your access key id>
    aws_secret_access_key = <your secret key>


## Docker


docker build -t surrizola/ff-selfie .


docker run -p 8080:8080 -d surrizola/ff-selfie


docker run -it --rm --name ffselfie-running-app surrizola/ff-selfie



docker run -p 8080:8080 -e PORT=5000  -v "$PWD":/usr/src/app surrizola/ff-selfie node test.js

