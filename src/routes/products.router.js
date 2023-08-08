import { Router } from 'express';
import { productModel } from '../dao/mongo/models/products.model.js';

const router = new Router();

router.get('/', async (req, res) => {
    let filter = {}
    let sort = {};
    let catQuery='';
    let prevLink = null;
    let nextLink = null;

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const category = req.query.category;
    const disponible = req.query.disponible;
    const sortOpt = req.query.sort;

    if (category) filter = {category}, catQuery = `&category=${category}`;
    if(disponible == 'si') filter = { stock: { $gt: 0}};
    if(disponible == 'no') filter = { stock: { $eq: 0}};
    if(sortOpt == 'asc') sort = { price: 1};
    if(sortOpt == 'desc') sort = { price: -1 };

    const {docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest} =
    await productModel.paginate(filter, {limit, page, lean: true, sort});
    const products = docs;
    if (page > rest.totalPages || !(/^\d+$/.test(page)) || page <= 0) return res.status(400).json({ status: "error", message: "Página inexistente" });
    if (hasPrevPage) prevLink = `http://localhost:8080/api/products?limit=${limit}&page=${parseInt(page)-1}&disponible=${disponible}&sort=${sortOpt}${catQuery}`;
    if (hasNextPage) nextLink = `http://localhost:8080/api/products?limit=${limit}&page=${parseInt(page)+1}&disponible=${disponible}&sort=${sortOpt}${catQuery}`;
    res.json({ status: "success", payload: products, totalPages: rest.totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink});
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productModel.findById(pid).lean();
        if (product) return res.json({status: "success", payload: product});
        return res.status(404).json({ Error: 'Producto no encontrado' });
    } catch (error) {
        return res.json({error: "Error al buscar el producto: " + error});
    }
})

router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    try {
        const result = await productModel.create({
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        })
        return res.status(201).json({ message: 'Producto Creado', payload: result});
    } catch (error) {
        return res.status(500).json({ error: "Error al crear el producto: " + error});
    }
});

router.put ('/:pid', async (req, res) => {
    const { pid } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const newProduct = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };
    try {
        const result = await productModel.updateOne({_id: pid}, newProduct ); 
        return res.status(200).json({ message: 'Producto Actualizado', payload: result});
    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar el producto: " + error});
    }
});

router.delete ('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const result = await productModel.deleteOne({_id: pid});
        return res.status(200).json({ message: 'Producto Eliminado', payload: result});
    } catch (error) {
        return res.status(500).json({ error: "Error al eliminar el producto: " + error});

    }
})

export default router;