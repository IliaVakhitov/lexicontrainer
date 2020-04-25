
export default async function fetchData(url, method = 'GET', headers = [], body = null) {

  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
  headers.forEach(header => {
    myHeaders.append(header.name, header.value);  
  });
  
  const response = await fetch(url, {
      method: method,
      credentials: 'include',
      headers: myHeaders,
      body: body
  });    
  if (!response.ok || response.status !== 200) {
    this.props.history.push({
      pathname:'/error', 
      state: { error: response.statusText}
    });
  }
  const data = response.json();
  if ('error' in data) {
    this.props.history.push({
      pathname:'/error', 
      state: { error: data.error}
    });
  } 
  return data;
}