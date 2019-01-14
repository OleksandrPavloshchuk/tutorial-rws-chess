const mediatorURL = "localhost:3016";

  function login(player, password, onSuccess, onError) {
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
        if( result.status!==200 ) {
          onSuccess(player);
        } else {
          onError(result.statusText);
        }
      }, (error) => {
        onError(error);
      });
  }

  function logout(player) {
    // TODO
  }

  function retrieveWaitingPlayers(player) {
    // TODO:
    return [];
  }

export default login, logout, retrieveWaitingPlayers;
