
export default async function fetchData(url, method = 'GET', headers = [], body = null) {

  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
  headers.forEach(header => {
    if (myHeaders.has(header.name)) {
      myHeaders.delete(header.name);
    }    
    myHeaders.append(header.name, header.value);  
  });
  
  const response = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: myHeaders,
      body: body
  });    
  // To stay on the page
  if (response.status === 401) {
    return response.json();
  }
  // Redirect to error page
  if (!response.ok || response.status !== 200) {
    this.props.history.push({
      pathname:'/error', 
      state: { error: response.statusText }
    });
  }
  const data = response.json();
  if ('error' in data) {
    // Redirect to error page
    this.props.history.push({
      pathname:'/error', 
      state: { error: data.error}
    });
  } 
  return data;
}