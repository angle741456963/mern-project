import axios from "axios";
const API_URL = "http://localhost:8080/api/user";

class AuthService {
  login(email, password) {
    return axios.post(API_URL + "/login", {
      email,
      password,
    });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username, email, password, role) {
    try {
      return axios.post(API_URL + "/register", {
        username,
        email,
        password,
        role,
      });
    } catch (e) {
      console.log(e);
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
