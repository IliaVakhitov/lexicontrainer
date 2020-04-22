
export default function fetchData(url, method = 'GET', headers = [], body = null) {
  
  //return url;

  var myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('token'));  
  headers.forEach(header => {
    myHeaders.append(header.name, header.value);  
  });

  return fetch(url, {
    method: method,
    headers: myHeaders,
    body: body
  })
    .then((response) => response.json())
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    }
  );  
}
