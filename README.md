//Correr el entorno virtual
venv\Scripts\activate

//Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

//Para ejecutar frontend
cd .\frontend\
npm start

//Para ejecutar backend
cd .\backend\
