import { Router } from 'express';
import { userModel } from '../dao/mongo/models/user.model.js';
import passport from 'passport';

const router = Router();

const adminCredentials = {
    email: 'adminCoder@coder.com',
    password: 'adminCod3r123',
    rol: 'admin',
};

router.post('/register', passport.authenticate("register"), async (req, res) => {
    res.send({status: 'success', message: "Usuario Creado"});
});

router.post('/login', passport.authenticate("login"), async (req, res) => {
    if(!req.user) return res.status(400).send({status: 'error', message:"Credenciales inválidas"});
    req.session.user = req.user;
    res.status(200).json({ status: 'success', payload: req.user });
});

router.get('/current', (req, res) => {
    req.session.user = req.user;
    const user = req.user;
    res.render('current', { user });
})

router.post ('/github', passport.authenticate('github'), async (req, res) => {})

router.get('/githubcallback', passport.authenticate('github'), async (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
});

router.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ status: 'error', message: 'Ha ocurrido un error al cerrar sesión.' });
        }
        res.json({ status: 'success', message: 'Sesión cerrada exitosamente.' });
    });
});

export default router;


