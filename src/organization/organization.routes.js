import { Router } from "express";
import { test, orgRequest, orgConfirm, orgRemove, orgReject, orgUpdate, searchOrg, allOrg, searchOrganizations, allPendingOrg } from './organization.controller.js'
import {validateJwt} from "../middlewares/validate-jwt.js"
import { upload } from '../utils/multerConfig.js';

const api = Router();

api.get('/test', test);
api.post('/request' ,[validateJwt, upload.single('img')], orgRequest);
api.put('/confirm', orgConfirm)
api.put('/deny', orgReject)
api.put('/remove', orgRemove)
api.put('/update/:id', orgUpdate)
api.post('/search', searchOrg)
api.get('/get', allOrg)
api.get('/get/pending', allPendingOrg)
api.get('/search/organizations', searchOrganizations);


export default api