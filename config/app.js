'use strict'
 
//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import orgRoutes from "../src/organization/organization.routes.js"
import userRoutes from '../src/User/user.routes.js'
 
//Inicializacion
 
const app = express()
    config();
    const port = process.env.PORT || 2690
 
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(cors())
 
    //Declaracion de rutas
    app.use('/org', orgRoutes)
    app.use('/user', userRoutes);
 
    export const initServer = ()=>{
        app.listen(port)
        console.log(`Server HTTP running in port ${port}`)
    }