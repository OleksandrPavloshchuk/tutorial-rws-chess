package authentication

// TODO (2019/01/14) check credentials from database
var passwords map[string]string

func Init() {
	passwords = make(map[string]string, 5)
	passwords["player-1"] = "123456"
	passwords["player-2"] = "654321"
	passwords["me"] = "1"
	passwords["player-3"] = "1"
	passwords["other"] = "2"
}

func CheckPassword(name string, password string) bool {
	if foundPassword, found := passwords[name]; found && foundPassword == password {
		return true
	} else {
		return false
	}
}
