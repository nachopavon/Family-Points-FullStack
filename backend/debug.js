// Debug del controlador
const AuthController = require('./src/controllers/authController');

console.log('AuthController:', AuthController);
console.log('AuthController.login:', AuthController.login);
console.log('typeof AuthController.login:', typeof AuthController.login);

if (AuthController.login) {
  console.log('✅ login method exists');
} else {
  console.log('❌ login method is undefined');
}
