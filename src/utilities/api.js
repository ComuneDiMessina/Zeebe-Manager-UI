import {store} from '../store'
const axios = require('axios')
const ERRORS = require('./errors').default

const instance = axios.create({
    baseURL: window.ENV.REACT_APP_API,
    timeout: 30000,
    
/*     headers:{'Access-Control-Allow-Origin': '*','Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'} */
  })

  var instanceTask = axios.create({
    baseURL: window.ENV.REACT_APP_TASK_API,
    timeout: 30000,
    //withCredentials: true   
    /*  headers:{'Access-Control-Allow-Headers': 'X-Auth-Token'  }*/})

//instanceTask.interceptors.request.use 




const getInstance = function () {

  const id_token = store.getState().oidcReducer.user.id_token
  const access_token = store.getState().oidcReducer.user.access_token
  instance.defaults = Object.assign(instance.defaults);
  instanceTask.defaults.headers.common['x-auth-token']=id_token
  instanceTask.defaults.headers.common['Authorization']="Bearer "+access_token
    return instance;
  }

  const getTaskInstance = function () {
    //const token = store.getState().oidcReducer.user.id_token
    //instanceTask.defaults = Object.assign(instanceTask.defaults, { headers: {  'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8','x-auth-token': "eyJ4NXQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJraWQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiTWVxbkt2d0tmR2s5aXNDMWtRTk5fdyIsImF1ZCI6WyI5N29DVGxjRmhhRGZubW80THZQenNTUXVxWE1hIiwiaHR0cDpcL1wvb3JnLndzbzIuYXBpbWd0XC9nYXRld2F5Il0sInN1YiI6InMucHVsY2luaS5hZCIsImF6cCI6Ijk3b0NUbGNGaGFEZm5tbzRMdlB6c1NRdXFYTWEiLCJhbXIiOltdLCJpc3MiOiJodHRwczpcL1wvc3BpZC1kZXYuY29tdW5lLm1lc3NpbmEuaXQ6NDQzXC9vYXV0aDJcL3Rva2VuIiwiZ3JvdXBzIjpbIlJPTEVfUkJfQURNSU4iLCJJbnRlcm5hbFwvZXZlcnlvbmUiLCJHUk9VUF9ST09NX0JPT0tJTkciXSwiZXhwIjoxNTc0NDMzNjI1LCJpYXQiOjE1NzQ0MzAwMjUsIm5vbmNlIjoiazQxOTYwa3AzYW0iLCJzaWQiOiIxMjljNDA4Yi0xOTVkLTQ2MGUtOGM1MC0xYjFkZjhiOTdkMDQifQ.DEjE9aVinqc-JifLEBMV5E33E98Uxl2bN-IYbTkEJwxCjDc1Nu2gAjcwzjMuvcgCpXlTP55iFd8G1JCx4XTh9gWq4XOXkIuLR6DVE8fVhQanVfpRwHAhip55fv6He9RmJYmXuKM_27aTNPgSJ-xhWZN4ujkEdpW2V2bCamvN3QE_dl3t03-Hs0Opjw_psROxcia8FvL3r-LB6iLYbelRv14WhTrqI_fb-h7kVC3OPzeFv4W82xTms4rpQQwQpR_qccvuV22HqzApoFVmC6fluytYIRpDCnYD2yZEL0y61rRyCO7EcawnZ6FgBHT6Wx2vThuzPvzgx24Rpsu63PQomw" } });
    instanceTask.defaults = Object.assign(instanceTask.defaults);
    instanceTask.defaults.headers.common['X-Auth-Token']='eyJ4NXQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJraWQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoic1FLYkpqMEFjQUozMXFpTzNLaVhFZyIsImF1ZCI6WyI5N29DVGxjRmhhRGZubW80THZQenNTUXVxWE1hIiwiaHR0cDpcL1wvb3JnLndzbzIuYXBpbWd0XC9nYXRld2F5Il0sInN1YiI6InMucHVsY2luaS5hZCIsImF6cCI6Ijk3b0NUbGNGaGFEZm5tbzRMdlB6c1NRdXFYTWEiLCJhbXIiOltdLCJpc3MiOiJodHRwczpcL1wvc3BpZC1kZXYuY29tdW5lLm1lc3NpbmEuaXQ6NDQzXC9vYXV0aDJcL3Rva2VuIiwiZ3JvdXBzIjpbIlJPTEVfUkJfQURNSU4iLCJJbnRlcm5hbFwvZXZlcnlvbmUiLCJHUk9VUF9ST09NX0JPT0tJTkciXSwiZXhwIjoxNTc0Njc5OTg1LCJpYXQiOjE1NzQ2NzYzODUsIm5vbmNlIjoiZGJzMW1wbHZvZm0ifQ.UIbdhsurPj39WWu6gKPoxqun4gun0XSQsaJkttU7HFgO5eQ5w5k_H8w3IRDmt3dYPCg8MfvEpDq6ryCYvZDZ2VtpKpSh6uRc4nN7q3Xe_EyT3zxpqIgvSKMHh0zC0c_7EE7-kLeG11ULdr7W5HzYpap6b_4tf1Pp33hBcAbXMCAOuU0uJ06DGDqNPczfU_JdD6wT5vO93Vi1HpbIYog6mITYoS7XO1tpG7GvwRBxx30tnIy9Q_mP-Zix_gq2bPQF8cOgOx1ecjV5xLFFWQswxEMlKKyGGyM-AsSWcEyDlg28j0XEbmmhrDK1e4gHx_Zp_jupM5t-SUAnNOFCp_JKSA'
    return instanceTask;
  }

  var wsError = function (error) {

    console.log(error)
    throw error
  }

  var CheckCall = function (data) {
    if (!data) {
      throw ERRORS.SEARCH.NOT_FOUND
    }
    return data
  }

var Get = function (url) {
    return getInstance()
      .get(url)
      .then(response => {
        return response
      })
      .catch(wsError)
  }

  var TaskGet = function (url) {

    // let config= {headers:{
    //   'Content-Type': 'application/json',
    //   'x-auth-token': 'eyJ4NXQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJraWQiOiJZbU15TnpRNVl6Z3laR1ZsTkRJd016TTROMkZoWkRZNFpXRXdNRFZqTnpneU5XVXhaREJsWXciLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoielVjMG04SzJCUmxrNHdkTUllTjF3dyIsImF1ZCI6WyI5N29DVGxjRmhhRGZubW80THZQenNTUXVxWE1hIiwiaHR0cDpcL1wvb3JnLndzbzIuYXBpbWd0XC9nYXRld2F5Il0sInN1YiI6InMucHVsY2luaS5hZCIsImF6cCI6Ijk3b0NUbGNGaGFEZm5tbzRMdlB6c1NRdXFYTWEiLCJhbXIiOltdLCJpc3MiOiJodHRwczpcL1wvc3BpZC1kZXYuY29tdW5lLm1lc3NpbmEuaXQ6NDQzXC9vYXV0aDJcL3Rva2VuIiwiZ3JvdXBzIjpbIlJPTEVfUkJfQURNSU4iLCJJbnRlcm5hbFwvZXZlcnlvbmUiLCJHUk9VUF9ST09NX0JPT0tJTkciXSwiZXhwIjoxNTc0NDM4Njg1LCJpYXQiOjE1NzQ0MzUwODUsIm5vbmNlIjoiZDhkZnFqeXF0eTcifQ.dYUu8AeNTWNnYVBj2x6Jahh8kCNTlRGYsax_r-zy-VPCHLd7civztG0YijWjpvhFA-J1H9KB9gLB3pOMbueT-aVA4dg8RIjzPT7Y5AqAxblTvx7u2_KDOXS-M0rdrLf3kWdFAdreRT6NDGQP0mxkHYiis8ubwWHxJBFNTzqW9kXzfjpB3ZezzVR_MAFOxbs4LSf1oa-gptOm725iFb12kGo8594JF8gPGUqV0cd6a4P3rQ7TIZd1yADjSj3ODZnc9Nz6Px8CsKJ2LvDDOs8mrbsfbwsI_kz-tE9VIMlWZ7LAkS3z5hKBLMc2tUHYkjq6U0X50YOU3l-YnM_-ewV8LQ',
    // }};

    return getTaskInstance().get(url)
      .then(response => {
        return response
      })
      .catch(wsError)
  }

var Post = function (url, body) {
    return getInstance()
      .post(url, body)
      .then(response => {
        return response
      })
      .catch(wsError)
  }


  var Put = function (url, body) {
    return getInstance()
      .put(url, body)
      .then(response => {
        return response
      })
      .catch(wsError)
  }


/*************************************GET************************************/


  export function listDiagram(){


    var url='/fs/file'
    return (Get(url).then(CheckCall).catch(wsError))


  }


  export function encodedFile(filename){


    var url='/fs/file/'+filename

    return (Get(url).then(CheckCall).catch(wsError))

  }

  export function logDiagram(filename){

var url = '/repo/file/'+filename
return (Get(url).then(CheckCall).catch(wsError))


  }

  export function monitoring(){

    var url ='/zeebeclient/monitoring'
    return (Get(url).then(CheckCall).catch(wsError))
  }


  export function listTask(){


    var url='/api/tasks/groups/list'
    return (TaskGet(url).then(CheckCall).catch(wsError))


  }


  /*************************************POST************************************/


  export function saveFile(body) {

    var url = '/repo/file'
    var file_ext=body.filename.split('.').pop()
    if(file_ext!="xml"&&file_ext!="bpmn")
    body.filename=body.filename+".bpmn"

  
    return (
      Post(url,body).then(CheckCall).catch(wsError)
    )
  
  }

  export function deployFile(body){


    var url='/zeebeclient/deploy'

    return (
      Post(url,body).then(CheckCall).catch(wsError)
    )


  }




  /*************************************PUT************************************/

  export function checkoutFile(body) {

    var url = '/repo/file/checkout'
  
    return (
      Put(url,body).then(CheckCall).catch(wsError)
    )
  
  }