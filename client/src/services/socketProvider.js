import Configuration from "./config";

export default class SocketProvider {
    constructor(dispatch, player) {
        this.socket = new WebSocket(new Configuration().webSocketUrl);
    
        this.socket.onopen = event => this.sendAction({type:"ASK_LOGIN", payload:{from:player}});
        this.socket.onerror = event => dispatch({type:"LOGIN_ERROR",payload:{text:"Can't connect to server"}});
        this.socket.onmessage = event => {
            // console.log('RECEIVED', event.data)
            dispatch(JSON.parse(event.data));
        };   
        
        this.sendAction = this.sendAction.bind(this);
        this.logout = this.logout.bind(this);  
        this.retrieveWaitingPlayers = this.retrieveWaitingPlayers.bind(this);  
    }        
    
    sendAction = v => this.socket.send(JSON.stringify(v));
    logout = player => this.sendAction({type:"LOGOUT", payload:{from:player}});
    retrieveWaitingPlayers = () => this.sendAction({type:"ASK_PLAYERS" });    
}
