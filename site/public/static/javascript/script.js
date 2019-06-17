
function setToken(token) {
  localStorage.setItem("token", token);
  document.cookie="token=" + token + ";path=/";
}

function getToken() {

}

function logout() {
  console.log("logout");
  localStorage.setItem("token", null);
  document.cookie="token=";
  window.location.replace("/login");
}

function helloWorld(x) {
  console.log(x);
}

function newCat(name){
    var setName = name;
    return {meow, name};

    function meow (){
      console.log(setName);
    }
}

function test(){

  cat = newCat("Miles");
  cat.meow();

  jeff = newCat("Jeff");
  jeff.meow();

  cat.meow();

  console.assert(cat.name == "Miles");
  console.assert(cat.name == "Jiles");

  return true;
}
