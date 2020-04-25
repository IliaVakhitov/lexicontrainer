
function handleErrors(response){
  console.log(response.statusText)
  return {'error' : response.statusText};   
}

async function fetchData(url, method = 'GET', headers = [], body = null) {

  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
  headers.forEach(header => {
    myHeaders.append(header.name, header.value);  
  });
  
  const response = await fetch(url, {
      method: method,
      headers: myHeaders,
      body: body
  });    
  if (!response.ok || response.status !== 200) {
    return handleErrors(response);
  }
  return response.json();
}


function checkError(data) {    
  if ('error' in data) {
    this.props.history.push({
      pathname:'/error', 
      state: { error: data.error}
    });
  }    
}

export { checkError, fetchData };