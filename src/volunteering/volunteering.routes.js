import { Router } from "express";
import { UpdateV, deleteV, listarVolunteering, registerV, test } from './volunteering.controller.js'

const api = Router();

api.get('/test', test);
api.post('/registerV',registerV)
api.delete('/deleteV/:id', deleteV)
api.get('/listarVolunteering', listarVolunteering)
api.put('/UpdateV/:id', UpdateV)

export default api