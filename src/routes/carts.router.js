import { Router } from 'express';
import { cartModel } from '../dao/mongo/models/carts.model.js';
import { productModel } from '../dao/mongo/models/products.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find();
        res.json({message: "Success", payload: carts});
    } catch (error) {
        res.status(500).json({error: "Error al buscar los productos en la base de datos: " + error});
    }    
});

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartModel.findById(cid).populate('products.product');

    if (!cart) {
      return res.status(404).json({ error: "Carrito inexistente" });
    }

    res.status(200).json({ payload: cart });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito: " + error });
  }
});

router.post('/', async (req, res) => {
    try {
        const result = await cartModel.create({});
        res.status(201).json({message: "Success", payload: result});
    } catch (error) {
        res.status(500).json({error: "Error al crear el cart: " + error});        
    }
});

router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const product = await productModel.findById(pid);
    const cart = await cartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito inexistente" });
    if (!product) return res.status(404).json({ error: "Producto inexistente" });

    const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }
    const updatedCart = await cart.save();
    res.status(200).json({ message: "Producto agregado correctamente", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito: " + error });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const updatedCart = await cartModel.findOneAndUpdate(
      { _id: cid, 'products.product': pid },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito o producto no encontrado" });
    }

    res.status(200).json({ message: "Cantidad del producto actualizada correctamente", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la cantidad del producto: " + error });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const updatedCart = await cartModel.findByIdAndUpdate(cid, { $pull: { products: { product: pid } } }, { new: true });

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito inexistente" });
    }

    res.status(200).json({ message: "Producto eliminado correctamente", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto del carrito: " + error });
  }
});

router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const updatedCart = await cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });

    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito inexistente" });
    }

    res.status(200).json({ message: "Todos los productos del carrito han sido eliminados", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar los productos del carrito: " + error });
  }
});

export default router;