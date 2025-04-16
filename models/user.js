
class User {
    constructor(id, first_name, last_name, email, password, balance, profile_image) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = password;
        this.balance = balance;
        this.profile_image = profile_image;
    }


}

module.exports = User;