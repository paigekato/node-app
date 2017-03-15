
function generateRandomString(n) {
  var r = " ";
  var s = "abcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i <= 6; i++) {
    r += s.charAt(Math.floor(Math.random() * s.length));
  }
  return r;
}
console.log(generateRandomString());