
## Build locally
You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) installed to build the project.

To install all project dependencies execute

```
npm install
```

Build the application (including [bpmn-js](https://github.com/bpmn-io/bpmn-js)) via

```
npm run build
```


You may also start the application
```
npm start
```

## Build using docker image
See Dockerfile [here](/Dockerfile)
```
docker image build -t zeebe-manager-fe:0.28.0 .
```
### Tag docker image
    docker tag zeebe-manager-fe:0.26.0  docker.eai.giottolabs.com/zeebe-manager-fe:0.26.0

### Push docker image
Login to Nexus repository
     
    docker login -u username -p password docker.eai.giottolabs.com
    docker push docker.eai.giottolabs.com/zeebe-manager-fe:0.26.0

