
const mediatorURL = "localhost:3016";

export default class MediatorClient {

  login(player, password, onSuccess, onError) {

/* TODO (2019/01/15) use axios here instead of fetch. Resolve CORS issue.
    axios("http://" + mediatorURL + "/login", {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
//        withCredentials: true,
        body: JSON.stringify({
          name: player,
          password: password
        })
      })
      .then(res => {
        console.log("res", res);
        if( !res.data ) {
          onSuccess(player);
        } else {
          onError(res.data);
        }
      })
      .catch( error => {
        console.log("error", error);
        onError(error);
      });
      */
    fetch("http://" + mediatorURL + "/login", {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      body: JSON.stringify({
        name: player,
        password: password
      })
    }).then( result => {
        // TODO how to get detailed error description ?
        if( result.status===200 ) {
          onSuccess(player);
        } else {
          onError(result.statusText);
        }
      }, error => {
        onError(new String(error));
      });
  }

  logout(player) {
    // TODO
  }

  retrieveWaitingPlayers(player) {
    // TODO:
    return [];
  }

}
