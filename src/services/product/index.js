import express from "express";
import models from "../../db/models/index.js";

const { Product, Review, Category, User, ProductCategory } = models;
const productRouter = express.Router();

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await Product.findAll({
      /*   include: [
        {
          model: Review,
        },
      ]  */
      include: [
        {
          model: Review,
          include: { model: User, attributes: ["name", "lastName"] },
        },
        { model: Category, through: { attributes: [] } },
      ],
    });
    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).send("Product not found");
    } else {
      res.send(product);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.post("/", async (req, res, next) => {
  try {
    const { name, description, image, price, categories } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      image,
      price,
    });
    const productId = newProduct.id;
    const data = [];
    if (categories) {
      categories.forEach((categoryId) => {
        data.push({ productId, categoryId });
      });
      await ProductCategory.bulkCreate(data);

      res.send(newProduct);
    } else {
      res.send(newProduct);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.put("/:id", async (req, res, next) => {
  try {
    const data = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    });
    res.send(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.delete("/:id", async (req, res, next) => {
  try {
    const rows = Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.send({ rows });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default productRouter;