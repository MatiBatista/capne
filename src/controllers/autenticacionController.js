const { sequelize } = require('../database/database');
const {crearToken}=require('../models/Jwt');
const Usuario =require('../models/Usuario');
const Persona=require('../models/Persona');
const Alumno=require('../models/Alumno');
const Maestro=require('../models/Maestro');


const login=async(req,res)=>{
try{
    const usuario=await Usuario.findOne({
        where: { username: req.body['username'] },
      });
    if (!usuario) {
        res.status(500).json({ "Exito": false,  "Mensaje": "Usuario o Contraseña incorrectos" });
      }
    const password=req.body['password'];
    const claveEsCorrecta=await usuario.verifyPassword(password);
    console.log(claveEsCorrecta);
    if(claveEsCorrecta){
        const persona=await Persona.findOne({
            where:{ idusuario: usuario.getId() }
        })
        const alumno = await Alumno.findOne({ where: { idpersona: persona.getId() } });
        const maestro = await Maestro.findOne({ where: { idpersona: persona.getId() } });
        var rol;
        if (alumno) {
            rol="alumno";
          } else if (maestro) {
            rol="maestro"
          } else {
            res.status(500).json({ "Exito": false, "Mensaje": "El username no es ni maestro ni profesor" });
          }
        const informacionUsuario = {
            nombre: persona.getNombre(),
            rol: rol
          };
        const token=crearToken(informacionUsuario);
        res.json({token});
    }
    else{
        res.status(500).json({ "Exito": false, "Mensaje": "Usuario o Contraseña incorrectos" });
    }
    
}   
catch($e){

}
}


module.exports={
    login
}