#!/bin/bash

# Script para corregir req.user.userId por req.user.id
sed -i '' 's/req\.user\.userId/req.user.id/g' backend/src/controllers/taskController.js
sed -i '' 's/req\.user\.userId/req.user.id/g' backend/src/controllers/authController.js
sed -i '' 's/req\.user\.userId/req.user.id/g' backend/src/controllers/familyController.js
sed -i '' 's/req\.user\.userId/req.user.id/g' backend/src/controllers/userController.js

echo "✅ Corrección completada"
