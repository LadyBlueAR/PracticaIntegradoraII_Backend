import { Router } from 'express';
import { productModel } from '../dao/mongo/models/products.model.js';
import { cartModel } from '../dao/mongo/models/carts.model.js';

const router = Router();

//user 
router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

//General routes
router.get('/', (req, res) => { 
    res.render('login');
});

router.get('/chat', (req, res) => {
    res.render('chat');
})

//product routes
router.get('/products', async (req, res) => {
    const user = req.session.user; 
    if(user) {
       
       let prevLink = null;
       let nextLink = null;
   
       const limit = req.query.limit || 5;
       const page = req.query.page || 1;
   
       const {docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest} =
       await productModel.paginate({}, {limit, page, lean: true});
       const products = docs;
       if (hasPrevPage) prevLink = `http://localhost:8080/products?limit=${limit}&page=${parseInt(page)-1}`;
       if (hasNextPage) nextLink = `http://localhost:8080/products?limit=${limit}&page=${parseInt(page)+1}`;
       res.render('products', {products, hasPrevPage, hasNextPage, prevLink, nextLink, user});
    } else {
        res.status(404).json({error: "usuario no encontrado"});
    }  
})

//cart routes
router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid).populate('products.product').lean();
    const products = cart.products;
    res.render ('cart', {cart, products})
})
export default router;

