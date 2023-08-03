const { sequelize } = require('../database/database');
const Usuario =require('../models/Usuario');
const Persona=require('../models/Persona');
const Alumno=require('../models/Alumno');
const Maestro=require('../models/Maestro');


const getUsuarios=async (req,res)=>{

  try {
    const usersWithPersons = await Usuario.findAll({
      attributes:['username'],
      include: [
        {
          model: Persona,
          attributes: ['nombre', 'apellido'],
          include: [
            {
              model: Alumno,
              attributes: ['legajo', 'imagen']
            }
          ]
        }
      ]
    });
    res.json(usersWithPersons);
  } catch (error) {
    return res.status(500).json({"Exito":false,"Mensaje":"Hubo un error al obtener todos los usuarios"});
  }
};

const getUser=async (req,res)=>{
    try{
        const {id}=req.params;
        const user=await Usuario.findOne(
            {
                where:{
                    id
                }
            }
        )
        res.json(user);

    }
    catch(error){
      
    }
}



const createUser = async (req, res) => {
  const { rol, ...userData } = req.body;

  try {
    await sequelize.transaction(async (transaction) => {
      const existingUser = await Usuario.findOne({ where: { username: userData.username } });
      if (existingUser) {
        throw new Error('El username ya existe en el sistema');
      }

      if (rol === 'Alumno') {
        const { legajo, imagen, ...personaData } = userData;
        const existingAlumno = await Alumno.findOne({ where: { legajo } });
        if (existingAlumno) {
          throw new Error('El legajo ya existe en el sistema');
        }

        const usuario = await Usuario.create({
          username: userData['username'],
          passwd: userData['password']
        }, { transaction });

        const persona = await Persona.create({
          nombre: userData['nombre'],
          apellido: userData['apellido'],
          fechanacimiento: userData['fechaDeNacimiento'],
          idusuario: usuario.id
        }, { transaction });

        await Alumno.create({
          legajo: userData['legajo'],
          imagen: userData['imagen'],
          idpersona: persona.id
        }, { transaction });
      } else if (rol === 'Maestro') {
        const { email, ...personaData } = userData;        
        const existeMaestro = await Maestro.findOne({ where: { email } });
        if (existeMaestro) {
          throw new Error('El email ingresado ya está registrado con otro maestro');
        }
        const usuario = await Usuario.create({
          username: userData['username'],
          passwd: userData['password']
        }, { transaction });
        const persona = await Persona.create({
          nombre: userData['nombre'],
          apellido: userData['apellido'],
          fechanacimiento: userData['fechaDeNacimiento'],
          idusuario: usuario.id
        }, { transaction });
        await Maestro.create({
          email:userData['email'],
          idpersona: persona.id
        }, { transaction });
      } else {
        throw new Error('El rol ingresado no es válido');
      }

      res.json({ "Exito": true, "Mensaje": "Usuario creado con éxito" });
    });
  } catch (error) {
    res.status(400).json({ "Exito": false, "Mensaje": error.message });
  }
};



  
module.exports={
    getUsuarios,
    createUser,
    getUser
}