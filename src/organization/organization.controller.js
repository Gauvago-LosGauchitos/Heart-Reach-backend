import Organization from './organization.model.js'
import User from '../User/user.model.js'
import fs from 'fs';

export const test = (req, res) => {
    console.log('test panoli')
    return res.send({
        message: 'test'
    })
}

export const orgRequest = async (req, res) => {
    try {
        let data = req.body;
        data.owner = req.user._id;

        // Validar que el usuario no sea 'ADMIN-ASOCIATION' o 'ADMIN'
        if (req.user.role === 'ADMIN-ASOCIATION' || req.user.role === 'ADMIN') {
            return res.status(400).send({
                message: 'You have an organization or you are an admin.'
            });
        }

        // Comprobar si ya existe una organización con el mismo nombre, dirección o número de teléfono
        const existingOrg = await Organization.findOne({
            $or: [
                { name: data.name },
                { address: data.address },
                { phone: data.phone }
            ]
        });

        if (existingOrg) {
            return res.status(400).send({
                message: 'The org request already exists or repeated data. The data that cannot be repeated is the name, address, and phone number.'
            });
        }

        // Procesar la imagen subida si existe
        if (req.file) {
            const imageData = fs.readFileSync(req.file.path);
            console.log(imageData)
            const base64Image = Buffer.from(imageData).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            data.images = imageUrl;
            fs.unlinkSync(req.file.path); 
        }

        // Crear una nueva solicitud de organización
        let newOrgRequest = new Organization({
            name: data.name,
            description: data.description,
            address: data.address,
            phone: data.phone,
            images: data.images,
            owner: req.user._id
        });

        await newOrgRequest.save();
        return res.send({
            message: 'The organization request has been successfully registered!'
            
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error requesting the organization', error: err });
    }
};


export const orgConfirm = async (req, res) => {
    try {
        let data = req.body
        let org = await Organization.findOne({ name: data.name })
        let orgRequest = await Organization.findOneAndUpdate(
            {
                name: data.name
            },
            {
                role: "ACEPTADO"
            }
        );
        let newOrgAdmin = await User.findById(org.owner)
        console.log(newOrgAdmin.role)
        if (newOrgAdmin.role === 'ADMIN') {
            return res.status(401).send({ message: 'And admin can`t have an organization' })
        }
        else if (newOrgAdmin.role === 'ADMIN-ASOCIATION') {
            return res.status(401).send({ message: 'This User have an organization' })
        } else {
            await User.findByIdAndUpdate(
                {
                    _id: orgRequest.owner
                },
                {
                    role: "ADMIN-ASOCIATION"
                }
            )
            return res.send({ message: 'Organization correctly added' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error acepting the organization' })
    }
}

export const orgReject = async (req, res) => {
    try {
        let data = req.body
        let org = await Organization.findOne({ name: data.name })
        let user = await User.findById(org.owner)
        if (user.role != 'ADMIN-ASOCIATION') {
            await Organization.findOneAndUpdate(
                {
                    name: data.name

                },
                {
                    role: "DENEGADO"
                }
            );
            return res.send({ message: 'Organization correctly denied' })
        }
        else {
            return res.status(401).send({ message: 'This organization has already been accepted if you need reject this delete whit `localhost:2690/org/delete`' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error acepting the organization' })
    }
}

export const orgRemove = async (req, res) => {
    try {
        let data = req.body
        let org = await Organization.findOne({ name: data.name })
        await Organization.findOneAndUpdate(
            {
                name: data.name

            },
            {
                role: "DENEGADO"
            }
        );
        let newOrgAdmin = await User.findById(org.owner)
        console.log(newOrgAdmin.role)
        if (newOrgAdmin.role === 'ADMIN-ASOCIATION') {
            await User.findByIdAndUpdate(
                {
                    _id: org.owner
                },
                {
                    role: "USER"
                }
            )
            return res.send({ message: 'Organization correctly removed' })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Error acepting the organization' })
    }
}

export const orgUpdate = async (req, res) => {
    try {
        let data = req.body
        let organization = await Organization.findById(req.params.id)

        if (!organization) {
            return res.status(404).send({ message: 'Organization not found' });
        }

        organization.name = data.name || organization.name
        organization.address = data.address || organization.address
        organization.phone = data.phone || organization.phone
        organization.email = data.email || organization.email
        organization.description = data.description || organization.description
        organization.images = data.images || organization.images

        await organization.save()

        return res.send({ message: 'Organization updated successfully', organization })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the organization', err: err })
    }
}

export const searchOrg = async (req, res) => {
    try {
        let { id } = req.body;
        console.log(id)
        let organizations = await Organization.findById(
            id
        );

        return res.send({ organizations });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error searching Organization' });
    }
}



export const allOrg = async (req, res) => {
    try {
        let organizations = await Organization.find();

        return res.send({ organizations });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error finding Organization' });
    }
}

export const searchOrganizations = async (req, res) => {
    const { query } = req.query;
    try {
        const organizations = await Organization.find({ name: { $regex: query, $options: 'i' } });
        res.json(organizations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error buscando organizaciones' });
    }
};