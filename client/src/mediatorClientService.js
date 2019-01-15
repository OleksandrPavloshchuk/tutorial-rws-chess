const mediatorURL = "localhost:3016";

export default class MediatorClient {

  login(player, password, onSuccess, onError) {
    fetch("http://localhost:3016/login", {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      body: JSON.stringify({
        name: player,
        password: password
      })
    }).then((result) => {
        // TODO how to get detailed error description ?
        if( result.status===200 ) {
          onSuccess(player);
        } else {
          console.log( 'result', result );
          onError(result.statusText);
        }
      }, (error) => {
        console.log( 'error', error );
        onError(error);
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
